NVM := source $$HOME/.nvm/nvm.sh && nvm use 20.20.0 >/dev/null

.PHONY: help install ios android live live-ios live-android restore-config apk ipa clean

help:
	@echo "Targets:"
	@echo "  make install        — npm install"
	@echo "  make ios            — build & run on the booted iOS simulator"
	@echo "  make android        — build & run on the running Android emulator"
	@echo "  make live-android   — run Android with livereload"
	@echo "  make live-ios       — run iOS with livereload"
	@echo "  make live           — both with livereload (Android first, iOS after delay)"
	@echo "  make restore-config — restore config.xml after a livereload session"
	@echo "  make apk            — build release APK"
	@echo "  make ipa            — build unsigned IPA"
	@echo "  make clean          — remove build outputs"

install:
	$(NVM) && npm install

ios:
	$(NVM) && ionic cordova build ios --no-confirm
	-xcrun simctl uninstall booted com.accenture.todos
	xcrun simctl install booted "platforms/ios/build/Debug-iphonesimulator/Todos App.app"
	xcrun simctl launch booted com.accenture.todos

android:
	$(NVM) && ionic cordova run android --no-confirm

restore-config:
	@sed -i.tmp -E 's|<content [^>]*/>|<content src="index.html" />|; /sessionid="[a-f0-9]+"/d' config.xml && rm -f config.xml.tmp

live-android: restore-config
	$(NVM) && ionic cordova run android --livereload --external --port=8100

live-ios: restore-config
	mkdir -p platforms/ios/build && ln -sf Debug-iphonesimulator platforms/ios/build/emulator
	$(NVM) && ionic cordova run ios --livereload --external --port=8101

live: restore-config
	mkdir -p platforms/ios/build && ln -sf Debug-iphonesimulator platforms/ios/build/emulator
	$(NVM) && trap 'kill 0' EXIT INT TERM; \
	  ionic cordova run android --livereload --external --port=8100 & \
	  sleep 60; \
	  ionic cordova run ios --livereload --external --port=8101 & \
	  wait

apk: restore-config
	$(NVM) && cd platforms/android && ./gradlew assembleRelease

ipa: restore-config
	cd platforms/ios && xcodebuild -workspace App.xcworkspace -scheme App \
	  -configuration Release -destination "generic/platform=iOS" \
	  -archivePath build/App.xcarchive archive \
	  CODE_SIGN_IDENTITY="" CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED=NO
	cd platforms/ios/build && rm -rf Payload && mkdir Payload && \
	  cp -R "App.xcarchive/Products/Applications/Todos App.app" "Payload/" && \
	  zip -qr Todos.ipa Payload && rm -rf Payload

clean:
	rm -rf www .angular platforms/ios/build
	-cd platforms/android && ./gradlew clean

# RCM Android packages

This directory contains the Android wrapper, frontend build, SDK toolchain, and final APKs. It builds two flavors: Citizen and Agent. The default `PocketBase` data mode embeds the frontend in the APK, enables PocketBase synchronization, and grants Internet access to the configured HTTPS PocketBase host. The APK does not contain a copy of the live database: both flavors and all phones read and write the same PocketBase collections, so business updates can be shared across devices.

The app API remains in demo/mock mode; PocketBase synchronizes the persisted demo business records and uploaded attachments. Login is still a local demo login. Do not expose real user data through anonymous PocketBase rules; production use needs a real authentication and authorization design. Required collection fields and API rules are documented in `POCKETBASE.md` at the repository root.

Map screens use HTTPS OpenStreetMap tiles and OSRM driving routes; the GIS overview also uses CARTO Voyager tiles. The native WebView explicitly allows these read-only map resources alongside the configured PocketBase host. Other remote resources, including sample photos, remain blocked by default. Maps still need a working network connection. HTTPS navigation links open in an installed browser or navigation app.

If a map works in the desktop APP preview but shows a blank basemap in an installed APK, check the native `RemoteResourcePolicy` as well as the phone's network. An application-generated `403 Offline` cannot be fixed by enabling a phone proxy. Changes to this native policy require rebuilding and reinstalling both APKs; updating the website alone does not update an installed app.

Run `node --test scripts/tests/android-map-network.test.mjs` from the repository root to check the native policy against the map URLs used by the app. The regression compiles and executes the production Java policy with JDK 17 (`JAVA_HOME`, the bundled build location, or Java on `PATH`).

The customer service complaint form uses Android's installed speech recognition service for voice input. Microphone permission is requested when the user starts recording; supported languages depend on the device's speech service. Complaint completion notices use native Android notifications after permission is granted, and tapping a notice opens the related complaint progress. These services are exposed only to the bundled app's top-level asset origin. Business data still synchronizes while the WebView is running; delivery after the app has fully closed requires a separately deployed background push service.

## Build PocketBase APKs (default)

With Node.js dependencies installed in the repository root and JDK 17 at `C:\Program Files\Java\jdk-17.0.8`, run:

```powershell
.\app-package\scripts\build-android.ps1
```

This writes `RCM-Citizen-pocketbase-debug.apk` and `RCM-Agent-pocketbase-debug.apk` to `app-package\output\`. Both contain the configured PocketBase endpoint (`https://pb.51xyu.com` by default). To target another PocketBase instance:

```powershell
.\app-package\scripts\build-android.ps1 -PocketBaseUrl "https://pb.example.com" -PocketBaseCollection "app_data" -PocketBaseFilesCollection "app_files"
```

PocketBase must have the collections and API rules configured before installing the packages. If CORS is restricted, allow the Android WebView asset origin `https://appassets.androidplatform.net`.

Use `-DataMode Offline` to create offline demo APKs without PocketBase synchronization. Use `-Variant Release` for a release build after configuring signing. The PocketBase URL is build-time configuration; rebuild both APKs after changing it.

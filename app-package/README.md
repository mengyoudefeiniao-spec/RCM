# RCM Android packages

This directory contains the Android wrapper, frontend build, SDK toolchain, and final APKs. It builds two flavors: Citizen and Agent. The default `PocketBase` data mode embeds the frontend in the APK, enables PocketBase synchronization, and grants Internet access to the configured HTTPS PocketBase host. The APK does not contain a copy of the live database: both flavors and all phones read and write the same PocketBase collections, so business updates can be shared across devices.

The app API remains in demo/mock mode; PocketBase synchronizes the persisted demo business records and uploaded attachments. Login is still a local demo login. Do not expose real user data through anonymous PocketBase rules; production use needs a real authentication and authorization design. Required collection fields and API rules are documented in `POCKETBASE.md` at the repository root.

Some screens reference third-party map tiles and sample photos. Those remain network-dependent and may not be available offline.

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

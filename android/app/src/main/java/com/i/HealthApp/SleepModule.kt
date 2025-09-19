package com.i.HealthApp

import android.content.Intent
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class SleepModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("SleepModule")

    Function("startTracking") { plannedStart: Long, targetEnd: Long ->
      val ctx = appContext.reactContext ?: return@Function false
      val intent = Intent(ctx, SleepTrackingService::class.java)
        .putExtra("plannedStart", plannedStart)
        .putExtra("targetEnd", targetEnd)
      ctx.startForegroundService(intent)
      true
    }

    Function("stopTracking") {
      val ctx = appContext.reactContext ?: return@Function false
      val intent = Intent(ctx, SleepTrackingService::class.java)
      ctx.stopService(intent)
      true
    }
  }
}



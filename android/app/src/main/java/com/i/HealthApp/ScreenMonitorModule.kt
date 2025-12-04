package com.i.HealthApp

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class ScreenMonitorModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private var screenReceiver: BroadcastReceiver? = null

    override fun getName() = "ScreenMonitor"

    @ReactMethod
    fun startMonitoring() {
        if (screenReceiver != null) return

        val filter = IntentFilter().apply {
            addAction(Intent.ACTION_SCREEN_ON)
            addAction(Intent.ACTION_SCREEN_OFF)
        }

        screenReceiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context?, intent: Intent?) {
                when (intent?.action) {
                    Intent.ACTION_SCREEN_OFF -> {
                        sendEvent("onScreenOff", null)
                    }
                    Intent.ACTION_SCREEN_ON -> {
                        sendEvent("onScreenOn", null)
                    }
                }
            }
        }

        reactApplicationContext.registerReceiver(screenReceiver, filter)
    }

    @ReactMethod
    fun stopMonitoring() {
        screenReceiver?.let {
            reactApplicationContext.unregisterReceiver(it)
            screenReceiver = null
        }
    }

    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }
}

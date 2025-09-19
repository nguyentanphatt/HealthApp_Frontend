package com.i.HealthApp

import android.app.*
import android.content.Intent
import android.os.IBinder
import android.os.SystemClock
import android.app.usage.UsageStatsManager
import android.app.usage.UsageEvents
import org.json.JSONObject
import java.util.*

class SleepTrackingService : Service() {

    private var serviceStartTime: Long = 0
    private val epochMs = 30_000L // 30s
    private val records = mutableListOf<JSONObject>()
    private var plannedSleepStart: Long = 0L
    private var plannedSleepEnd: Long = 0L
    private var actualSleepStart: Long? = null
    private var actualWakeTime: Long? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        serviceStartTime = System.currentTimeMillis()
        plannedSleepStart = intent?.getLongExtra("plannedStart", serviceStartTime) ?: serviceStartTime
        plannedSleepEnd = intent?.getLongExtra("targetEnd", plannedSleepStart + 8 * 3600_000) ?: (plannedSleepStart + 8 * 3600_000)

        // Foreground notification
        val notification = Notification.Builder(this, "sleep_channel")
            .setContentTitle("Sleep tracking running")
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .build()

        startForeground(1, notification)

        Thread {
            var now: Long
            var hadSlept = false

            while (true) {
                now = System.currentTimeMillis()
                val begin = now - epochMs
                val interactiveMs = getInteractiveDuration(begin, now)
                val isAwakeEpoch = interactiveMs >= (0.3 * epochMs)

                val epochObj = JSONObject().apply {
                    put("begin", begin)
                    put("end", now)
                    put("interactiveMs", interactiveMs)
                    put("awake", isAwakeEpoch)
                }
                records.add(epochObj)

                // Xác định giờ ngủ thực tế: epoch đầu tiên sau plannedSleepStart mà không thức
                if (now >= plannedSleepStart && actualSleepStart == null && !isAwakeEpoch) {
                    actualSleepStart = begin
                }

                if (actualSleepStart != null) hadSlept = true

                // Xác định giờ dậy thực tế: nếu đã ngủ rồi, sau plannedSleepEnd gặp epoch thức đầu tiên
                if (hadSlept && now >= plannedSleepEnd && isAwakeEpoch && actualWakeTime == null) {
                    actualWakeTime = begin
                }

                // Điều kiện dừng: đã xác định wake sau planned end
                if (actualWakeTime != null) break

                SystemClock.sleep(epochMs)
            }

            val summary = summarize(records, actualSleepStart, actualWakeTime)
            println("Sleep summary: $summary")
            // TODO: gửi summary lên backend ở đây

            stopSelf()
        }.start()

        return START_NOT_STICKY
    }

    private fun getInteractiveDuration(begin: Long, end: Long): Long {
        val usm = getSystemService(USAGE_STATS_SERVICE) as UsageStatsManager
        val events = usm.queryEvents(begin, end)
        val e = UsageEvents.Event()
        var lastInteractiveStart: Long? = null
        var interactive = 0L

        while (events.hasNextEvent()) {
            events.getNextEvent(e)
            when (e.eventType) {
                UsageEvents.Event.SCREEN_INTERACTIVE,
                UsageEvents.Event.SCREEN_RESUMED -> {
                    if (lastInteractiveStart == null) lastInteractiveStart = e.timeStamp
                }
                UsageEvents.Event.SCREEN_NON_INTERACTIVE,
                UsageEvents.Event.SCREEN_PAUSED,
                UsageEvents.Event.SCREEN_STOPPED -> {
                    if (lastInteractiveStart != null) {
                        interactive += (e.timeStamp - lastInteractiveStart!!)
                        lastInteractiveStart = null
                    }
                }
            }
        }
        lastInteractiveStart?.let { interactive += (end - it) }
        return interactive
    }

    private fun summarize(
        data: List<JSONObject>,
        actualSleepStart: Long?,
        actualWakeTime: Long?
    ): JSONObject {
        var asleep = 0L
        var awake = 0L

        data.forEach { obj ->
            val isAwake = obj.getBoolean("awake")
            val begin = obj.getLong("begin")
            val end = obj.getLong("end")
            val dur = end - begin
            if (isAwake) awake += dur else asleep += dur
        }

        return JSONObject().apply {
            put("totalSleepHours", asleep / 3600_000.0)
            put("totalAwakeHours", awake / 3600_000.0)
            put("plannedStart", plannedSleepStart)
            put("plannedEnd", plannedSleepEnd)
            put("sleepActualStart", actualSleepStart)
            put("wakeActualTime", actualWakeTime)
            put("epochs", data.size)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null
}

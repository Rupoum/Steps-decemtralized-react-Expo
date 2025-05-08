import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import android.util.Log

class AsyncStorageHelper(context: Context) : SQLiteOpenHelper(
    context,
    "RKStorage",
    null,
    1
) {
    companion object {
        private const val TAG = "AsyncStorageHelper"
    }

    override fun onCreate(db: SQLiteDatabase) {
        // Create the table if it does not exist
        db.execSQL("CREATE TABLE IF NOT EXISTS catalystLocalStorage (key TEXT PRIMARY KEY, value TEXT)")
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {}

    fun getAsyncStorageValue(key: String): String? {
        return try {
            val db = readableDatabase
            try {
                // Ensure the table exists
                onCreate(db)

                // Query the table
                val queryCursor = db.query(
                    "catalystLocalStorage",
                    arrayOf("value"),
                    "key = ?",
                    arrayOf(key),
                    null, null, null
                )

                try {
                    if (queryCursor.moveToFirst()) {
                        queryCursor.getString(0)
                    } else {
                        null
                    }
                } finally {
                    queryCursor.close()
                }
            } finally {
                db.close()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error reading from RKStorage", e)
            null
        }
    }
}
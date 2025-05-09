package com.youval21.StepsDecentralized
import retrofit2.http.Body
import retrofit2.http.POST
import retrofit2.http.GET

interface BackendApiService {
    @GET("hello")
   suspend fun  getstep(): Getresponse
   @POST("update")
   suspend  fun sendSteps(@Body request: StepsRequest): StepsResponse
   @POST("update/sleep")
   suspend fun sendSleep(@Body request:SleepRequest):SleepRequest
}
data class StepsResponse(
    val success: Boolean,
    val message: String
)
data class StepsRequest(
    val steps:String,
    val userid:String
)
data class Getresponse(
    val message: String?
)
data class SleepRequest(
    val hours:String,
     val userid:String
)
data class SleepResponse(
    val message:String
)
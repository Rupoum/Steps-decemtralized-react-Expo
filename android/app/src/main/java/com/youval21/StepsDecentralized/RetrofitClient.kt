package com.youval21.StepsDecentralized

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {
    private const val BASE_URL = "https://solara-azh3gzava8a0dvdr.canadacentral-01.azurewebsites.net/api/v1"
    val instance: BackendApiService by lazy {
        Retrofit.Builder()
            .baseUrl("https://solara-azh3gzava8a0dvdr.canadacentral-01.azurewebsites.net/api/v1/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(BackendApiService::class.java)
    }
}
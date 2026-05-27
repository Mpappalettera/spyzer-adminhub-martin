package com.spyzer.crm_backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI spyzerOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Spyzer CRM API")
                        .description("API REST para la gestión del CRM de trading Spyzer")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Spyzer Team")
                                .email("marting.pappalettera@gmail.com")));
    }
}

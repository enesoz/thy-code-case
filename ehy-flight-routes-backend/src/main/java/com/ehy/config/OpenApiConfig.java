package com.ehy.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI/Swagger configuration.
 * Provides API documentation with JWT authentication support.
 */
@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "Bearer Authentication";

    /**
     * Configure OpenAPI documentation
     * @return OpenAPI configuration
     */
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Enes Airlines Flight Route System API")
                        .version("1.0.0")
                        .description("""
                                Backend API for aviation route calculation system.

                                **Features:**
                                - Route calculation with flights and ground transportation
                                - Support for BUS, SUBWAY, UBER transfers
                                - Operating days validation
                                - JWT authentication
                                - Role-based access control (ADMIN, AGENCY)
                                - Redis caching for route search

                                **Authentication:**
                                Use the /api/auth/login endpoint to obtain a JWT token.
                                Then use the token in the Authorization header: Bearer {token}
                                """)
                        .contact(new Contact()
                                .name("EHY Airlines Development Team")
                                .email("csenes1987@gmail.com"))
                        .license(new License()
                                .name("Private")
                                .url("https://www.linkedin.com/in/eneso/")))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME,
                                new SecurityScheme()
                                        .name(SECURITY_SCHEME_NAME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Enter JWT token obtained from /api/auth/login")));
    }
}

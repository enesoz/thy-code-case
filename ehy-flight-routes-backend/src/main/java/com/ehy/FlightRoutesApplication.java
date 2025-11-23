package com.ehy;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.core.env.Environment;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Main application class for Enes Airlines Flight Route System.
 * Starts the Spring Boot application with all required configurations.
 */
@SpringBootApplication
@EnableCaching
@EnableJpaAuditing
public class FlightRoutesApplication {

    private static final Logger logger = LoggerFactory.getLogger(FlightRoutesApplication.class);

    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(FlightRoutesApplication.class);
        Environment env = app.run(args).getEnvironment();

        logApplicationStartup(env);
    }

    /**
     * Log application startup information
     * @param env Spring Environment
     */
    private static void logApplicationStartup(Environment env) {
        String protocol = "http";
        if (env.getProperty("server.ssl.key-store") != null) {
            protocol = "https";
        }

        String serverPort = env.getProperty("server.port", "8080");
        String contextPath = env.getProperty("server.servlet.context-path", "/");
        String hostAddress = "localhost";

        logger.info("""

                ----------------------------------------------------------
                Application '{}' is running!
                Access URLs:
                \tLocal:      {}://{}:{}{}
                \tExternal:   {}://{}:{}{}
                \tSwagger:    {}://{}:{}{}/swagger-ui.html
                \tH2 Console: {}://{}:{}{}/h2-console (if enabled)
                Profile(s): {}
                ----------------------------------------------------------
                """,
                env.getProperty("spring.application.name"),
                protocol, hostAddress, serverPort, contextPath,
                protocol, hostAddress, serverPort, contextPath,
                protocol, hostAddress, serverPort, contextPath,
                protocol, hostAddress, serverPort, contextPath,
                env.getActiveProfiles().length > 0 ?
                        String.join(", ", env.getActiveProfiles()) : "default"
        );
    }
}

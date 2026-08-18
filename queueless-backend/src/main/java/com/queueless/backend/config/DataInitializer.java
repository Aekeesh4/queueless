package com.queueless.backend.config;

import com.queueless.backend.entity.Role;
import com.queueless.backend.entity.User;
import com.queueless.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner createDefaultStaff(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {

        return args -> {

            if (!userRepository.existsByUsername("staff123")) {

                User staff = new User(
                        "Admin Staff",
                        "staff123",
                        passwordEncoder.encode("staff123"),
                        Role.STAFF
                );

                userRepository.save(staff);

                System.out.println(
                        "Default STAFF user created: staff123"
                );
            }
        };
    }
}
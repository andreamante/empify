package com.place.app.persistence.repository;

import com.place.app.persistence.entity.User;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Locale;
import java.util.Optional;

@ApplicationScoped
public class UserRepository implements PanacheRepository<User> {
    public Optional<User> findByEmail(String email) {
        return find("lower(email)", email.toLowerCase(Locale.ROOT)).firstResultOptional();
    }

    public boolean existsByUsername(String username) {
        return count("lower(username)", username.toLowerCase(Locale.ROOT)) > 0;
    }

    public boolean existsByEmail(String email) {
        return count("lower(email)", email.toLowerCase(Locale.ROOT)) > 0;
    }
}

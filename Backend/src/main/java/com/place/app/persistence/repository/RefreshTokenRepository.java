package com.place.app.persistence.repository;

import com.place.app.persistence.entity.RefreshToken;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.LockModeType;

import java.util.Optional;

@ApplicationScoped
public class RefreshTokenRepository implements PanacheRepository<RefreshToken> {
    public Optional<RefreshToken> findByTokenHashForUpdate(String tokenHash) {
        return find("tokenHash", tokenHash)
                .withLock(LockModeType.PESSIMISTIC_WRITE)
                .firstResultOptional();
    }

    public long deleteAllForUserId(long userId) {
        var tokens = find("user.id", userId).list();
        tokens.forEach(this::delete);
        return tokens.size();
    }
}

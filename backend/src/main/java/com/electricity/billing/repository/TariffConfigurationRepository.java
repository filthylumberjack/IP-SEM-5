package com.electricity.billing.repository;

import com.electricity.billing.entity.TariffConfiguration;
import com.electricity.billing.entity.enums.ConnectionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TariffConfigurationRepository extends JpaRepository<TariffConfiguration, Long> {

    Optional<TariffConfiguration> findByConnectionTypeAndIsActiveTrue(ConnectionType connectionType);

    Optional<TariffConfiguration> findByConnectionType(ConnectionType connectionType);
}

package com.github.snuk87.keycloak.kafka;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

import org.apache.kafka.clients.producer.Producer;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.clients.producer.RecordMetadata;
import org.jboss.logging.Logger;
import org.keycloak.events.Event;
import org.keycloak.events.EventListenerProvider;
import org.keycloak.events.EventType;
import org.keycloak.events.admin.AdminEvent;
import org.keycloak.events.admin.ResourceType;
import org.keycloak.representations.idm.RealmRepresentation;
import org.keycloak.util.JsonSerialization;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.snuk87.keycloak.kafka.beans.TenantMessage;

public class KafkaEventListenerProvider implements EventListenerProvider {

	private static final Logger LOG = Logger.getLogger(KafkaEventListenerProvider.class);

	private String topicEvents;

	private List<EventType> events;

	private String topicAdminEvents;

	private Producer<String, String> producer;

	private ObjectMapper mapper;

	public KafkaEventListenerProvider(String bootstrapServers, String clientId, String topicEvents, String[] events,
			String topicAdminEvents) {
		this.topicEvents = topicEvents;
		this.events = new ArrayList<>();
		this.topicAdminEvents = topicAdminEvents;

		for (int i = 0; i < events.length; i++) {
			try {
				EventType eventType = EventType.valueOf(events[i].toUpperCase());
				this.events.add(eventType);
			} catch (IllegalArgumentException e) {
				LOG.debug("Ignoring event >" + events[i] + "<. Event does not exist.");
			}
		}

		producer = KafkaProducerFactory.createProducer(clientId, bootstrapServers);
		mapper = new ObjectMapper();
	}

	private void produceEvent(String eventAsString, String topic) throws InterruptedException, ExecutionException {
		LOG.debug("Produce to topic: " + topicEvents + " ...");
		ProducerRecord<String, String> record = new ProducerRecord<>(topic, eventAsString);
		Future<RecordMetadata> metaData = producer.send(record);
		RecordMetadata recordMetadata = metaData.get();
		LOG.debug("Produced to topic: " + recordMetadata.topic());
	}

	@Override
	public void onEvent(Event event) {
		// ignore
	}

	@Override
	public void onEvent(AdminEvent event, boolean includeRepresentation) {
		if (topicAdminEvents != null) {
			try {
				if (ResourceType.REALM.equals(event.getResourceType())) {
					RealmRepresentation realm = JsonSerialization.readValue(event.getRepresentation(),
							RealmRepresentation.class);
					TenantMessage tenantMessage = new TenantMessage();
					tenantMessage.setType(event.getOperationType().toString());
					tenantMessage.setTenant(realm.getRealm());

					produceEvent(mapper.writeValueAsString(tenantMessage), topicAdminEvents);
				}
			} catch (JsonProcessingException | ExecutionException e) {
				LOG.error(e.getMessage(), e);
			} catch (InterruptedException e) {
				LOG.error(e.getMessage(), e);
				Thread.currentThread().interrupt();
			} catch (IOException e) {
				LOG.error(e.getMessage(), e);
			}
		}
	}

	@Override
	public void close() {
		// ignore
	}
}

package com.example.demo;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import io.livekit.server.AccessToken;
import io.livekit.server.RoomJoin;
import io.livekit.server.RoomName;
import io.livekit.server.WebhookReceiver;
import livekit.LivekitWebhook.WebhookEvent;


@CrossOrigin(origins = "*")
@RestController
public class Controller {
	@Value("${livekit.api.key}")
	private String LIVEKIT_API_KEY;
	
	@Value("${livekit.api.secret}")
	private String LIVEKIT_API_SECRET;
	
	@PostMapping(value = "/token")
	public ResponseEntity<Map<String, String>> createToken(@RequestBody Map<String, String> params)
	{
		String roomName = params.get("roomNeme");
		String paparticipantName = params.get("participantName");
		
		if(roomName==null||paparticipantName==null)
		{
			return ResponseEntity.badRequest().body(Map.of("errorMessage", "roomName and participantName are required"));
		}
		
		AccessToken token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
		token.setName(paparticipantName);
		token.setIdentity(paparticipantName);
		token.addGrants(new RoomJoin(true),new RoomName(roomName));
		
		return ResponseEntity.ok(Map.of("token",token.toJwt()));
	}
	
	@PostMapping(value = "/livekit/webhook",consumes = "application/webhook+json")
	public ResponseEntity<String> receiveWebhook(@RequestHeader("Authorization") String authHeader,@RequestBody String body)
	{
		WebhookReceiver webhookReceiver = new WebhookReceiver(LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
		try {
			WebhookEvent event = webhookReceiver.receive(body, authHeader);
			System.out.println("livekit Webhook: "+event.toString());
		} catch (Exception e) {
			System.err.println("Error validating webhook event: " + e.getMessage());
		}
		
		return ResponseEntity.ok("ok");
	}
	
}

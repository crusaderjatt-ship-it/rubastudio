# Ruba Studio – Database Design

## users
- id
- email
- name
- password_hash or auth_provider_id
- created_at

## outfits
- id
- user_id
- name
- image_urls
- ai_analysis_json
- created_at

## generated_images
- id
- user_id
- outfit_id
- prompt_text
- image_url
- thumbnail_url
- is_favorite
- created_at

## edit_history
- id
- generated_image_id
- instruction
- previous_image_url
- new_image_url
- created_at

## captions
- id
- generated_image_id
- caption_text
- hashtags
- created_at

## settings
- id
- user_id
- default_model
- default_backdrop
- default_aspect_ratio

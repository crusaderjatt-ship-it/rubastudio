# Ruba Studio – API Specification Draft

## Auth
POST /api/auth/login
POST /api/auth/logout

## Outfit
POST /api/outfits/upload
POST /api/outfits/{id}/analyze
GET /api/outfits

## Generate
POST /api/generate
GET /api/generate/{job_id}

## Edit
POST /api/edit

## Gallery
GET /api/gallery
POST /api/gallery/{image_id}/favorite
DELETE /api/gallery/{image_id}

## Caption
POST /api/caption

## Share
POST /api/share/prepare

## Example Generate Request
```json
{
  "outfit_id": "uuid",
  "model": "ruba",
  "pose": "walking smiling",
  "backdrop": "Chandigarh garden",
  "aspect_ratio": "9:16",
  "count": 4
}
```

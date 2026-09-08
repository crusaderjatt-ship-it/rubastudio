# Ruba Studio – AI Prompt & Consistency Engine

## Objective
Ensure every generated image keeps:
- Ruba's face and body consistent
- uploaded outfit faithful
- background realistic
- final image Instagram-ready

## Prompt Inputs
- Ruba model profile
- outfit image analysis
- user selected pose
- user selected backdrop
- optional edit instruction
- previous image metadata

## Rules
1. Outfit image is the source of truth.
2. If user asks for the same outfit, preserve garment design exactly.
3. If user asks for same backdrop, reuse previous scene style.
4. If user asks for pants, do not generate salwar.
5. If user asks for salwar, do not generate pants.
6. If user asks for braid not visible in front, keep braid behind.
7. Always prefer natural Punjabi styling over bridal styling unless requested.

## Quick Edit Templates
- Change footwear to white.
- Make smile more charming.
- Keep same face and body.
- Make full body.
- Remove signboard.
- Keep same backdrop.
- Make it more realistic.

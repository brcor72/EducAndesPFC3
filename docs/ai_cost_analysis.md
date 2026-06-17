# Gemini AI Token Usage & Cost Analysis

This document details the cost efficiency, plausibility, and security controls for the AI Practice Engine using Google's **Gemini 2.5 Flash** model.

---

## 1. Model Selection: Gemini 2.5 Flash
We have selected **Gemini 2.5 Flash** due to:
* **Inexpensive Pricing:** Near-zero operation costs.
* **Low-Resource Language Support:** Industry-leading performance in translating and chatting in low-resource regional languages (including Quechua and Aymara).
* **Speed:** Extremely fast response times (low latency), critical for mobile web users on 3G/4G connections.

---

## 2. API Pricing & Token Math

### Current Pricing (Google AI Studio - Paid Tier)
* **Input Tokens**: `$0.075` per 1,000,000 tokens (approx. `$0.000075` per 1,000 tokens)
* **Output Tokens**: `$0.300` per 1,000,000 tokens (approx. `$0.000300` per 1,000 tokens)

### Cost Calculation for a 10-Turn Lesson Practice Session
An average simulation session has 10 dialogue turns (user asks/replies, AI responds).

#### Input Tokens (Accumulated context)
Every turn sends the System prompt, lesson context, and the full conversation history.
* *Turn 1*: System instruction & lesson context (1,000 tokens) + User input (50 tokens) = 1,050 tokens.
* *Turn 5*: Context & prompt (1,000 tokens) + History (1,000 tokens) + User input (50 tokens) = 2,050 tokens.
* *Turn 10*: Context & prompt (1,000 tokens) + History (2,000 tokens) + User input (50 tokens) = 3,050 tokens.
* **Average Input per Turn**: `1,500` tokens.
* **Total Input over 10 Turns**: `15,000` tokens.
* **Total Input Cost**: `15,000 * ($0.075 / 1,000,000) = $0.001125`

#### Output Tokens
The AI response is usually short and direct (about 100 tokens per turn).
* **Total Output over 10 Turns**: `1,000` tokens.
* **Total Output Cost**: `1,000 * ($0.300 / 1,000,000) = $0.000300`

#### Total Session Cost
* **Total Cost per Session**: `$0.001425`
* **In Peruvian Soles (PEN)**: `~S/ 0.0053` (less than half of one Peruvian cent).
* **1,000 completed student practice sessions cost S/ 5.30 ($1.425).**

---

## 3. Plausibility & The Free Tier

For development, testing, and low-traffic production releases, Google offers a **generous Free Tier** on Google AI Studio:
* **Rate Limits**: 15 Requests Per Minute (RPM), 1,500 Requests Per Day (RPD), and 1,000,000 Tokens Per Minute (TPM).
* **Cost**: `$0.00`
* **Plausibility**: If our platform has 100 active students doing 2 practice sessions per day (2,000 total requests/day), the free tier will cover the vast majority of our daily needs. Transitioning to the paid tier is extremely cheap and can be funded easily with micro-donations or small institutional grants.

---

## 4. Cost-Containment & Abuse Prevention Rules

To protect our API key from malicious token consumption, we enforce four security layers on the backend:

1. **Authentication Guard (`JwtAuthGuard`)**
   - The `/api/v1/ai/practice` endpoint rejects anonymous calls. Only students logged in with a valid Peruvian DNI can talk to the agent.
2. **Rate Limiting (`NestJS Throttler`)**
   - The endpoint is throttled to a maximum of **10 messages per minute per user**.
3. **Session Turn Limit**
   - A single practice session is hard-coded to support a maximum of **15 dialogue turns**. If a user exceeds 15 turns, the backend returns: *"Has alcanzado el límite de intentos para esta práctica. Procede a enviar tu conclusión."*
4. **Context Cache / Session Lock**
   - A student can only run one active practice simulation context at a time, preventing scripts from parallelizing queries.

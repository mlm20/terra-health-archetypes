FILE GENERATED ON - 2025-08-12
ultrathink

# Expert Software Engineer Role

You are acting as an expert senior software engineer specializing in typescript development. All code you write must be exclusively in typescript.

Your machine publicly accessible IP is 18.170.33.156.
Ports open: 3000, 5000, 8000
Use http://18.170.33.156:PORT for as your base application URL if running a webapp server.
You are running on Ubuntu 24.04 LTS. You have access to `curl` and `wget`.

Use ISO Dates where possible (YYYY-MM-DD) instead of Unix timestamps.

Where possible you should specify a sensible redirect URL.

## SDK Outline
You are given a brief summary of the Terra API typescript SDK in the `<sdk>` section below.

When you need information about SDK components:
- Use the `askSdk` MCP tool to:
  - Look up the structure of specific objects
  - Check what parameters a function requires
  - Get example code snippets demonstrating usage
- Before you implement, check the types of the method, interfaces and data models using `askModelShape` tool.

This will help you understand how to properly implement the Terra API functionality required for this task.

<sdk>
# Reference

## Authentication

<details><summary><code>client.authentication.<a href="/src/api/resources/authentication/client/Client.ts">authenticateuser</a>({ ...params }) -> Terra.AuthenticationAuthenticateUserResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Creates a login link that allows end users to connect their fitness tracking account

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.authentication.authenticateuser({
    resource: "FITBIT",
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Terra.AuthenticationAuthenticateUserRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Authentication.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.authentication.<a href="/src/api/resources/authentication/client/Client.ts">generatewidgetsession</a>({ ...params }) -> Terra.AuthenticationGenerateWidgetSessionResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Generates a link to redirect an end user to for them to select an integration and log in with their fitness data provider

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.authentication.generatewidgetsession();
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Terra.WidgetSessionParams`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Authentication.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.authentication.<a href="/src/api/resources/authentication/client/Client.ts">deauthenticateuser</a>({ ...params }) -> Terra.AuthenticationDeauthenticateUserResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Deletes all records of the user on Terra's end, revoking Terra's access to their data

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.authentication.deauthenticateuser({
    user_id: "user_id",
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Terra.AuthenticationDeauthenticateUserRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Authentication.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.authentication.<a href="/src/api/resources/authentication/client/Client.ts">generateauthtoken</a>() -> Terra.AuthenticationGenerateAuthTokenResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Creates a token to be used with initConnection() functions in the Terra mobile SDKs in order to create a user record for Apple Health or Samsung Health (or equivalent)

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.authentication.generateauthtoken();
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**requestOptions:** `Authentication.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## User

<details><summary><code>client.user.<a href="/src/api/resources/user/client/Client.ts">modifyuser</a>(userId, { ...params }) -> Terra.UserModifyUserResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Update a Terra user's reference_id or active status

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.user.modifyuser("user_id");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**userId:** `string` — Terra user ID to update

</dd>
</dl>

<dl>
<dd>

**request:** `Terra.UserModifyUserRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `User.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.user.<a href="/src/api/resources/user/client/Client.ts">getinfoforuserid</a>({ ...params }) -> Terra.UserGetInfoForUserIdResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Used to query for information on one Terra user ID, or to query for all registered Terra User objects under one reference ID

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.user.getinfoforuserid();
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Terra.UserGetInfoForUserIdRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `User.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.user.<a href="/src/api/resources/user/client/Client.ts">getalluserids</a>({ ...params }) -> Terra.UserGetAllUserIDsResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Used to query for information for all Terra User IDs. Supports optional pagination via `page` and `per_page`. If `page` is not provided, it returns all users in one go (backwards compatibility).

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.user.getalluserids();
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Terra.UserGetAllUserIDsRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `User.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.user.<a href="/src/api/resources/user/client/Client.ts">getinfoformultipleuserids</a>({ ...params }) -> Terra.TerraUser[]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Used to query for information for multiple Terra User IDs

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.user.getinfoformultipleuserids(["string"]);
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `string[]`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `User.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## Activity

<details><summary><code>client.activity.<a href="/src/api/resources/activity/client/Client.ts">fetch</a>({ ...params }) -> Terra.ActivityFetchResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Fetches completed workout sessions, with a defined start and end time and activity type (e.g. running, cycling, etc.)

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.activity.fetch({
    user_id: "user_id",
    start_date: 1,
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Terra.ActivityFetchRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Activity.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.activity.<a href="/src/api/resources/activity/client/Client.ts">write</a>({ ...params }) -> Terra.ActivityWriteResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Used to post activity data to a provider. This endpoint only works for users connected via Wahoo. Returns error for other providers.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.activity.write({
    data: [
        {
            metadata: {
                end_time: "2022-10-28T10:00:00.000000+01:00",
                start_time: "1999-11-23T09:00:00.000000+02:00",
                summary_id: "123e4567-e89b-12d3-a456-426614174000",
                type: 1.1,
                upload_type: 1.1,
            },
        },
    ],
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Terra.ActivityWriteRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Activity.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## Athlete

<details><summary><code>client.athlete.<a href="/src/api/resources/athlete/client/Client.ts">fetch</a>({ ...params }) -> Terra.AthleteFetchResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Fetches relevant profile info such as first & last name, birth date etc. for a given user ID

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.athlete.fetch({
    user_id: "user_id",
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Terra.AthleteFetchRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Athlete.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## Body

<details><summary><code>client.body.<a href="/src/api/resources/body/client/Client.ts">fetch</a>({ ...params }) -> Terra.BodyFetchResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Fetches body metrics such as weight, height, body fat percentage etc. for a given user ID

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.body.fetch({
    user_id: "user_id",
    start_date: 1,
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Terra.BodyFetchRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Body.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.body.<a href="/src/api/resources/body/client/Client.ts">write</a>({ ...params }) -> Terra.BodyWriteResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Used to post body data to a provider. This endpoint only works for users connected via Google Fit. Returns error for other providers.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.body.write({
    data: [
        {
            metadata: {
                end_time: "2022-10-28T10:00:00.000000+01:00",
                start_time: "1999-11-23T09:00:00.000000+02:00",
            },
        },
    ],
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Terra.BodyWriteRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Body.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.body.<a href="/src/api/resources/body/client/Client.ts">delete</a>({ ...params }) -> Terra.BodyDeleteResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Used to delete Body metrics the user has registered on their account

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.body.delete({
    user_id: "user_id",
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Terra.BodyDeleteRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Body.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## Daily

<details><summary><code>client.daily.<a href="/src/api/resources/daily/client/Client.ts">fetch</a>({ ...params }) -> Terra.DailyFetchResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Fetches daily summaries of activity metrics such as steps, distance, calories burned etc. for a given user ID

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.daily.fetch({
    user_id: "user_id",
    start_date: 1,
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Terra.DailyFetchRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Daily.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## Menstruation

<details><summary><code>client.menstruation.<a href="/src/api/resources/menstruation/client/Client.ts">fetch</a>({ ...params }) -> Terra.MenstruationFetchResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Fetches menstruation data such as cycle length, period length, ovulation date etc. for a given user ID

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.menstruation.fetch({
    user_id: "user_id",
    start_date: 1,
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Terra.MenstruationFetchRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Menstruation.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## Nutrition

<details><summary><code>client.nutrition.<a href="/src/api/resources/nutrition/client/Client.ts">fetch</a>({ ...params }) -> Terra.NutritionFetchResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Fetches nutrition log data such as meal type, calories, macronutrients etc. for a given user ID

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.nutrition.fetch({
    user_id: "user_id",
    start_date: 1,
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Terra.NutritionFetchRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Nutrition.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.nutrition.<a href="/src/api/resources/nutrition/client/Client.ts">write</a>({ ...params }) -> Terra.NutritionWriteResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Used to post nutrition logs to a provider. This endpoint only works for users connected via Fitbit. Returns error for other providers.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.nutrition.write({
    data: [
        {
            metadata: {
                end_time: "2022-10-28T10:00:00.000000+01:00",
                start_time: "1999-11-23T09:00:00.000000+02:00",
            },
        },
    ],
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Terra.NutritionWriteRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Nutrition.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.nutrition.<a href="/src/api/resources/nutrition/client/Client.ts">delete</a>({ ...params }) -> Terra.NutritionDeleteResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Used to delete nutrition logs the user has registered on their account

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.nutrition.delete({
    user_id: "user_id",
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Terra.NutritionDeleteRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Nutrition.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## Sleep

<details><summary><code>client.sleep.<a href="/src/api/resources/sleep/client/Client.ts">fetch</a>({ ...params }) -> Terra.SleepFetchResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Fetches sleep data such as sleep duration, sleep stages, sleep quality etc. for a given user ID, for sleep sessions with a defined start and end time

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.sleep.fetch({
    user_id: "user_id",
    start_date: 1,
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Terra.SleepFetchRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Sleep.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## Plannedworkout

<details><summary><code>client.plannedworkout.<a href="/src/api/resources/plannedworkout/client/Client.ts">fetch</a>({ ...params }) -> Terra.PlannedWorkoutFetchResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Used to get workout plans the user has registered on their account. This can be strength workouts (sets, reps, weight lifted) or cardio workouts (warmup, intervals of different intensities, cooldown etc)

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.plannedworkout.fetch({
    user_id: "user_id",
    start_date: 1,
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Terra.PlannedWorkoutFetchRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Plannedworkout.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.plannedworkout.<a href="/src/api/resources/plannedworkout/client/Client.ts">write</a>({ ...params }) -> Terra.PlannedWorkoutWriteResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Used to post workout plans users can follow on their wearable. This can be strength workouts (sets, reps, weight lifted) or cardio workouts (warmup, intervals of different intensities, cooldown etc)

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.plannedworkout.write({
    data: [{}],
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Terra.PlannedWorkoutWriteRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Plannedworkout.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.plannedworkout.<a href="/src/api/resources/plannedworkout/client/Client.ts">delete</a>({ ...params }) -> Terra.PlannedWorkoutDeleteResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Used to delete workout plans the user has registered on their account. This can be strength workouts (sets, reps, weight lifted) or cardio workouts (warmup, intervals of different intensities, cooldown etc)

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.plannedworkout.delete({
    user_id: "user_id",
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Terra.PlannedWorkoutDeleteRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Plannedworkout.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## Integrations

<details><summary><code>client.integrations.<a href="/src/api/resources/integrations/client/Client.ts">fetch</a>() -> Terra.IntegrationsFetchResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieve a list of all available provider integrations on the API.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.integrations.fetch();
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**requestOptions:** `Integrations.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.integrations.<a href="/src/api/resources/integrations/client/Client.ts">detailedfetch</a>({ ...params }) -> Terra.IntegrationsResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieve a detailed list of supported integrations, optionally filtered by the developer's enabled integrations and the requirement for SDK usage.

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.integrations.detailedfetch();
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Terra.IntegrationsDetailedFetchRequest`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Integrations.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

</sdk>

The typescript (package: terra-api) SDK has been installed for you.

However, in case you need to install the SDK again, use this command:
```bash
npm i -s terra-api
```

For Python projects, use `uv` as your package manager.
> uv manages project dependencies and environments, with support for lockfiles, workspaces, and more, similar to rye or poetry:
```sh
$ uv init example
Initialized project `example` at `/home/user/example`

$ cd example

$ uv add ruff
Creating virtual environment at: .venv
Resolved 2 packages in 170ms
   Built example @ file:///home/user/example
Prepared 2 packages in 627ms
Installed 2 packages in 1ms
 + example==0.1.0 (from file:///home/user/example)
 + ruff==0.5.0

$ uv run ruff check
All checks passed!

$ uv lock
Resolved 2 packages in 0.33ms

$ uv sync
Resolved 2 packages in 0.70ms
Audited 1 package in 0.02ms
```

## Secrets
Your Terra API key (exported as `TERRA_API_KEY`) and developer ID (exported as `TERRA_DEV_ID`) is located in `.env` in the current folder.
You should not attempt to read this. Instead use the `importenv` command in your `bash` terminal to import the `.env` into your current environment. Alternative you may use your typescript way of importing environment variables from `.env` files.

## Structured Problem-Solving Approach

Follow this systematic thinking process for your implementation:

1. **Problem Understanding**
   - Restate the key requirements in your own words
   - Identify the specific Terra API components needed
   - Define expected inputs and outputs

2. **Knowledge Acquisition**
   - Use `askDocs` to gather necessary documentation
   - Use `askSdk` to understand relevant SDK methods
   - Use `askModelShape` to understand shape of interfaces and types
   - Research any typescript-specific patterns needed

3. **Solution Design**
   - Break down the problem into logical components
   - Sketch the high-level architecture/flow
   - Identify potential design patterns to apply

4. **Implementation Strategy**
   - Plan your code structure (classes/functions/modules)
   - Consider dependencies and their initialization
   - Map out error handling strategy

5. **Coding & Documentation**
   - Write clean, well-structured code
   - Include thorough inline documentation
   - Follow typescript best practices

6. **Review & Reflection**
   - Verify solution meets all requirements
   - Identify potential improvements or optimizations
   - Highlight any assumptions or limitations

## Guidelines for Implementation

1. **Research First**: Use the `askDocs` and `askSdk`, `askModelShape` MCP tools before writing any code to ensure you understand the relevant Terra APIs, libraries, and best practices.

2. **Code Quality Standards**:
   - Write clean, maintainable, and well-documented code
   - Follow established typescript conventions and best practices
   - Include appropriate error handling and input validation
   - Optimize for performance and readability
   - Ensure your code is modular and reusable

3. **Communication Requirements**:
   - Explain your implementation approach before coding
   - Document any assumptions you're making
   - Highlight any potential issues or edge cases
   - Explain complex or non-obvious parts of your solution

4. **Output Format**:
   - Provide code in properly formatted code blocks
   - Include necessary comments
   - Structure your response logically (approach → implementation → explanation)

Work through each step of the structured approach methodically. Document your thinking process at each stage.

## Your Assignment

You have been tasked with implementing the following plan:

<plan>
# Detailed Terra Integration Plan

---

## 1. Frontend: Add Terra Connection Step

### 1.1. UI/UX Changes
- Add a new first step: “Connect your wearable.”
- Show a “Connect Wearable” button.
- Disable further steps until connection is complete.

### 1.2. Terra Widget Integration
- On button click, call a new backend endpoint (`/api/terra/widget-session`) to get a Terra Widget session URL.
- Redirect the user to the Terra Widget (in a new tab or modal).
- After successful connection, Terra redirects to your backend callback endpoint with a code/user_id.
- Backend stores the Terra user ID in the session (in-memory).
- Frontend polls or waits for confirmation, then advances to the next step.

---

## 2. Backend: Terra Authentication & Session Management

### 2.1. Endpoints to Implement
- **POST `/api/terra/widget-session`**
  - Calls Terra’s `generatewidgetsession`.
  - Returns the widget session URL to the frontend.
- **GET `/api/terra/callback`**
  - Handles Terra’s redirect after user connects.
  - Extracts Terra user ID (and any tokens if needed).
  - Stores Terra user ID in your session (in-memory, mapped to your session ID).
  - Redirects user back to the frontend (e.g., `/flow?connected=1`).
- **GET `/api/terra/status`**
  - Returns whether the current session has a connected Terra user ID.
  - Used by the frontend to know when to advance.

---

## 3. Backend: Fetching Health Data from Terra

### 3.1. Data Fetch Endpoint
- **POST `/api/terra/fetch-data`**
  - Requires a valid session with a Terra user ID.
  - Calls all relevant Terra endpoints:
    - `activity.fetch`
    - `sleep.fetch`
    - `body.fetch`
    - `daily.fetch`
    - `nutrition.fetch`
    - `menstruation.fetch`
    - `plannedworkout.fetch`
  - Use a 28-day window (or as much as available).
  - Aggregate and normalize the data into a single object.

### 3.2. Data Mapping
- Map Terra’s data fields to your archetype generation format.
- If a data type is missing, handle gracefully (e.g., empty arrays).

---

## 4. Backend: Archetype Generation
- **Update `/api/archetype/generate`**
  - Use the real Terra data from the session instead of mock data.
  - Pass the aggregated data to your OpenAI-based archetype logic.
  - Continue with your existing image generation flow.

---

## 5. Backend: Disconnecting the User from Terra
- **POST `/api/terra/disconnect`**
  - Calls Terra’s `deauthenticateuser` with the Terra user ID.
  - Removes the Terra user ID from your session/in-memory store.
  - Called automatically after archetype generation is complete.

---

## 6. Privacy & Security
- All Terra API calls are made from the backend.
- No persistent storage: All user data and Terra user IDs are held in memory and wiped after use.
- After archetype generation, immediately disconnect the user from Terra and clear all data.

---

## 7. Error Handling & Edge Cases
- If the user closes the widget or fails to connect, show an error and allow retry.
- If Terra returns no data, show a friendly message and allow retry or fallback to mock data.
- If deauthentication fails, log the error but still clear local data.

---

## 8. File/Code Structure Changes

### Backend
- `server/src/routes/terra.ts` (new): All Terra-related endpoints.
- Update `server/src/index.ts` to use the new Terra router.
- Update session management to map session IDs to Terra user IDs.
- Update archetype route to use real data.

### Frontend
- Update `ArchetypeFlowPage.tsx` to add/connect the new step.
- Add logic to handle widget session, polling for connection status, and error states.

---

## 9. Example API Flows

### Widget Session
```typescript
// Backend: POST /api/terra/widget-session
await client.authentication.generatewidgetsession();
```

### Fetch Data
```typescript
// Backend: POST /api/terra/fetch-data
await client.activity.fetch({ user_id, start_date });
await client.sleep.fetch({ user_id, start_date });
// ...repeat for all data types
```

### Deauthenticate
```typescript
// Backend: POST /api/terra/disconnect
await client.authentication.deauthenticateuser({ user_id });
```

---

## 10. Mermaid Diagram: End-to-End Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant TerraAPI

    User->>Frontend: Clicks "Connect Wearable"
    Frontend->>Backend: POST /api/terra/widget-session
    Backend->>TerraAPI: generatewidgetsession
    TerraAPI-->>Backend: Widget URL
    Backend-->>Frontend: Widget URL
    Frontend->>User: Opens Terra Widget
    User->>TerraAPI: Authenticates, selects provider
    TerraAPI->>Backend: Callback with user_id
    Backend->>Backend: Store Terra user_id in session
    Backend-->>Frontend: (via polling/status) Connection confirmed
    Frontend->>Backend: POST /api/terra/fetch-data
    Backend->>TerraAPI: Fetch all health data
    TerraAPI-->>Backend: Health data
    Backend->>Backend: Aggregate & normalize data
    Backend->>Backend: Generate archetype (OpenAI)
    Backend-->>Frontend: Archetype & image
    Backend->>TerraAPI: deauthenticateuser
    Backend->>Backend: Wipe session data
```

---

## 11. Optional: Advanced Features
- Provider selection UI: Show available providers before widget launch (optional).
- Progress feedback: Show stepper/progress for connection, data fetch, archetype generation, and disconnection.
- Reconnect/retry: Allow user to retry connection if something fails.

---

## Summary Table: New/Changed Endpoints

| Endpoint                      | Method | Purpose                                 |
|-------------------------------|--------|-----------------------------------------|
| `/api/terra/widget-session`   | POST   | Get Terra widget session URL            |
| `/api/terra/callback`         | GET    | Handle Terra OAuth/widget callback      |
| `/api/terra/status`           | GET    | Check if Terra user is connected        |
| `/api/terra/fetch-data`       | POST   | Fetch all available Terra health data   |
| `/api/archetype/generate`     | POST   | Generate archetype using Terra data     |
| `/api/terra/disconnect`       | POST   | Disconnect user from Terra, clear data  |

</plan>

Where possible, use the SDK provided models. If you are unsure of the model shape, use `askSdk` MCP tool to check.

Using the <plan>, think through your steps you need to take before modifying the codebase.

Do not terminate until you have completed the plan.

Before you execute any action, you MUST explore the entire codebase first. Start by listing all files.
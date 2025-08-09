--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.12 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: pg_cron; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION pg_cron; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_cron IS 'Job scheduler for PostgreSQL';


--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA extensions;


--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql;


--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql_public;


--
-- Name: pg_net; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_net; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_net IS 'Async HTTP';


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgbouncer;


--
-- Name: pgmq; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgmq;


--
-- Name: pgsodium; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgsodium;


--
-- Name: pgsodium; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgsodium WITH SCHEMA pgsodium;


--
-- Name: EXTENSION pgsodium; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgsodium IS 'Pgsodium is a modern cryptography library for Postgres.';


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA realtime;


--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA storage;


--
-- Name: supabase_functions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA supabase_functions;


--
-- Name: supabase_migrations; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA supabase_migrations;


--
-- Name: testing; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA testing;


--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA vault;


--
-- Name: http; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;


--
-- Name: EXTENSION http; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION http IS 'HTTP client for PostgreSQL, allows web page retrieval inside the database.';


--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: pgjwt; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgjwt WITH SCHEMA extensions;


--
-- Name: EXTENSION pgjwt; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgjwt IS 'JSON Web Token API for Postgresql';


--
-- Name: pgmq; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgmq WITH SCHEMA pgmq;


--
-- Name: EXTENSION pgmq; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgmq IS 'A lightweight message queue. Like AWS SQS and RSMQ but on Postgres.';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: vector; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;


--
-- Name: EXTENSION vector; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION vector IS 'vector data type and ivfflat and hnsw access methods';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- Name: admin_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.admin_role AS ENUM (
    'guide',
    'admin'
);


--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'community_manager',
    'member'
);


--
-- Name: beta_feature; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.beta_feature AS ENUM (
    'video_intro',
    'transcription',
    'newUserFlowBeta'
);


--
-- Name: feature_flag_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.feature_flag_type AS ENUM (
    'new_dashboard',
    'experimental_tools',
    'advanced_analytics',
    'beta_features'
);


--
-- Name: gap_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.gap_status AS ENUM (
    'open',
    'closed'
);


--
-- Name: match_analysis_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.match_analysis_type AS ENUM (
    'stance',
    'learning',
    'touchpoint',
    'disagreement'
);


--
-- Name: pacing_level; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.pacing_level AS ENUM (
    'light',
    'moderate',
    'consistent',
    'deep_dive'
);


--
-- Name: saved_item_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.saved_item_type AS ENUM (
    'microtranslation',
    'idea',
    'resource'
);


--
-- Name: session_frequency; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.session_frequency AS ENUM (
    'weekly',
    'biweekly',
    'thrice_weekly'
);


--
-- Name: session_time; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.session_time AS ENUM (
    '9AM',
    '12PM',
    '3PM',
    '6PM'
);


--
-- Name: tool_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tool_type AS ENUM (
    'chatgpt_plus',
    'lovable_dev',
    'descript',
    'upduo'
);


--
-- Name: action; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


--
-- Name: admin_role; Type: TYPE; Schema: testing; Owner: -
--

CREATE TYPE testing.admin_role AS ENUM (
    'guide,admin'
);


--
-- Name: app_role; Type: TYPE; Schema: testing; Owner: -
--

CREATE TYPE testing.app_role AS ENUM (
    'community_manager,member'
);


--
-- Name: gap_status; Type: TYPE; Schema: testing; Owner: -
--

CREATE TYPE testing.gap_status AS ENUM (
    'open,closed'
);


--
-- Name: pacing_level; Type: TYPE; Schema: testing; Owner: -
--

CREATE TYPE testing.pacing_level AS ENUM (
    'light,moderate,consistent,deep_dive'
);


--
-- Name: saved_item_type; Type: TYPE; Schema: testing; Owner: -
--

CREATE TYPE testing.saved_item_type AS ENUM (
    'microtranslation,idea,resource'
);


--
-- Name: session_frequency; Type: TYPE; Schema: testing; Owner: -
--

CREATE TYPE testing.session_frequency AS ENUM (
    'weekly,biweekly,thrice_weekly'
);


--
-- Name: session_time; Type: TYPE; Schema: testing; Owner: -
--

CREATE TYPE testing.session_time AS ENUM (
    '9AM,12PM,3PM,6PM'
);


--
-- Name: tool_type; Type: TYPE; Schema: testing; Owner: -
--

CREATE TYPE testing.tool_type AS ENUM (
    'chatgpt_plus,lovable_dev,descript,upduo'
);


--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
  BEGIN
    IF EXISTS (
      SELECT 1
      FROM pg_event_trigger_ddl_commands() AS ev
      JOIN pg_extension AS ext
      ON ev.objid = ext.oid
      WHERE ext.extname = 'pg_net'
    )
    THEN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_roles
        WHERE rolname = 'supabase_functions_admin'
      )
      THEN
        CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
      END IF;

      GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

      IF EXISTS (
        SELECT FROM pg_extension
        WHERE extname = 'pg_net'
        -- all versions in use on existing projects as of 2025-02-20
        -- version 0.12.0 onwards don't need these applied
        AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8.0', '0.10.0', '0.11.0')
      ) THEN
        ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
        ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

        ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
        ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

        REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
        REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

        GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
        GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      END IF;
    END IF;
  END;
  $$;


--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: -
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RAISE WARNING 'PgBouncer auth request: %', p_usename;

    RETURN QUERY
    SELECT usename::TEXT, passwd::TEXT FROM pg_catalog.pg_shadow
    WHERE usename = p_usename;
END;
$$;


--
-- Name: accept_hat_detection(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.accept_hat_detection(p_detection_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_user_id UUID;
  v_hat_name TEXT;
  v_subject_statuses JSONB[];
  v_source TEXT;
  v_session_id TEXT;
BEGIN
  -- Get detection details
  SELECT 
    user_id, 
    hat_name,
    source,
    session_id
  INTO 
    v_user_id, 
    v_hat_name,
    v_source,
    v_session_id
  FROM public.hat_detections
  WHERE id = p_detection_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Mark detection as approved
  UPDATE public.hat_detections
  SET status = 'approved', updated_at = now()
  WHERE id = p_detection_id;
  
  -- Get current subject statuses
  SELECT subject_statuses INTO v_subject_statuses
  FROM profiles
  WHERE id = v_user_id;
  
  -- Add hat to subject_statuses
  v_subject_statuses := array_append(
    v_subject_statuses, 
    jsonb_build_object('name', v_hat_name, 'status', 'active')
  );
  
  -- Update profile
  UPDATE profiles
  SET subject_statuses = v_subject_statuses
  WHERE id = v_user_id;
  
  -- Record metadata about the source
  INSERT INTO public.hat_metadata (
    user_id, 
    hat_name, 
    source, 
    session_id
  ) VALUES (
    v_user_id,
    v_hat_name,
    v_source,
    v_session_id
  );
  
  RETURN TRUE;
END;
$$;


--
-- Name: FUNCTION accept_hat_detection(p_detection_id uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.accept_hat_detection(p_detection_id uuid) IS 'Accepts a hat detection, adds it to the user profile, and records metadata.';


--
-- Name: admin_add_beta_user(uuid, public.beta_feature[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_add_beta_user(user_id uuid, features_array public.beta_feature[]) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  is_admin boolean;
BEGIN
  -- Check if the current user is an admin
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND email LIKE '%@sideby.ai'
  ) INTO is_admin;
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Only administrators can add beta users';
  END IF;
  
  -- Insert the beta user
  INSERT INTO public.beta_users (user_id, features)
  VALUES (user_id, features_array);
  
  RETURN true;
END;
$$;


--
-- Name: admin_pre_enroll_beta_user(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_pre_enroll_beta_user(email_address text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  is_admin boolean;
BEGIN
  -- Check if the current user is an admin
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND email LIKE '%@sideby.ai'
  ) INTO is_admin;
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Only administrators can pre-enroll beta users';
  END IF;
  
  -- Insert the email into pending enrollments
  INSERT INTO public.beta_user_pending_emails (email, status)
  VALUES (email_address, 'pending');
  
  RETURN true;
END;
$$;


--
-- Name: admin_remove_beta_user(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_remove_beta_user(beta_user_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  is_admin boolean;
BEGIN
  -- Check if the current user is an admin
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND email LIKE '%@sideby.ai'
  ) INTO is_admin;
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Only administrators can remove beta users';
  END IF;
  
  -- Delete the beta user
  DELETE FROM public.beta_users WHERE id = beta_user_id;
  
  RETURN true;
END;
$$;


--
-- Name: admin_remove_pending_beta_email(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_remove_pending_beta_email(email_address text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  is_admin boolean;
BEGIN
  -- Check if the current user is an admin
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND email LIKE '%@sideby.ai'
  ) INTO is_admin;
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Only administrators can remove pending beta emails';
  END IF;
  
  -- Delete the pending email
  DELETE FROM public.beta_user_pending_emails WHERE email = email_address;
  
  RETURN true;
END;
$$;


--
-- Name: auto_enroll_beta_users(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.auto_enroll_beta_users() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Check if the new user's email is in the pending enrollment list
    IF EXISTS (
        SELECT 1 FROM public.beta_user_pending_emails
        WHERE email = NEW.email
    ) THEN
        -- Add the user to beta program
        INSERT INTO public.beta_users (user_id, features)
        VALUES (NEW.id, ARRAY['newUserFlowBeta']::beta_feature[]);
        
        -- Remove from pending list
        DELETE FROM public.beta_user_pending_emails
        WHERE email = NEW.email;
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: can_complete_matches(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.can_complete_matches(user_id uuid) RETURNS boolean
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public', 'auth'
    AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = user_id 
    AND email LIKE '%@sideby.ai'
  );
$$;


--
-- Name: check_column_exists(text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_column_exists(table_name text, column_name text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
DECLARE
  column_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = $1
      AND column_name = $2
  ) INTO column_exists;
  
  RETURN column_exists;
END;
$_$;


--
-- Name: clean_test_schema(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.clean_test_schema() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE 
    r RECORD;
BEGIN
    FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'testing'
    LOOP
        EXECUTE format('TRUNCATE TABLE testing.%I CASCADE', r.tablename);
    END LOOP;
END;
$$;


--
-- Name: count_user_matches(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.count_user_matches(user_id uuid) RETURNS integer
    LANGUAGE sql SECURITY DEFINER
    AS $$
  SELECT COUNT(*)::integer 
  FROM public.matches
  WHERE (user1_id = user_id OR user2_id = user_id)
  AND status = 'active';
$$;


--
-- Name: create_hat_detection(uuid, text, text, double precision, text, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_hat_detection(p_user_id uuid, p_hat_name text, p_source text DEFAULT 'session_transcript'::text, p_confidence double precision DEFAULT NULL::double precision, p_session_id text DEFAULT NULL::text, p_metadata jsonb DEFAULT '{}'::jsonb) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_detection_id UUID;
BEGIN
  -- Check if a similar detection already exists
  SELECT id INTO v_detection_id
  FROM public.hat_detections
  WHERE user_id = p_user_id
  AND hat_name = p_hat_name
  AND status = 'pending'
  LIMIT 1;
  
  -- If it exists, just return that ID
  IF v_detection_id IS NOT NULL THEN
    RETURN v_detection_id;
  END IF;
  
  -- Otherwise create a new detection
  INSERT INTO public.hat_detections (
    user_id, 
    hat_name, 
    source, 
    confidence, 
    session_id, 
    metadata
  ) VALUES (
    p_user_id,
    p_hat_name,
    p_source,
    p_confidence,
    p_session_id,
    p_metadata
  )
  RETURNING id INTO v_detection_id;
  
  RETURN v_detection_id;
END;
$$;


--
-- Name: FUNCTION create_hat_detection(p_user_id uuid, p_hat_name text, p_source text, p_confidence double precision, p_session_id text, p_metadata jsonb); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.create_hat_detection(p_user_id uuid, p_hat_name text, p_source text, p_confidence double precision, p_session_id text, p_metadata jsonb) IS 'Stores a hat detection in the database. Used by edge functions and other system components to record hat suggestions.';


--
-- Name: create_notification_entry(uuid, uuid, text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_notification_entry(p_receiver_id uuid, p_sender_id uuid, p_message_content text, p_match_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  sender_name TEXT;
  notification_prefs JSONB;
  formatted_content TEXT;
  sender_type TEXT;
BEGIN
  -- Get notification preferences for the receiver
  SELECT notification_preferences INTO notification_prefs 
  FROM profiles 
  WHERE id = p_receiver_id;
  
  -- Determine sender type from match_scheduling_messages
  SELECT msg.sender_type INTO sender_type
  FROM match_scheduling_messages msg
  WHERE msg.match_id = p_match_id 
  AND msg.sender_id = p_sender_id
  ORDER BY msg.created_at DESC
  LIMIT 1;
  
  -- Get sender name based on sender_type
  IF sender_type = 'admin' THEN
    sender_name := 'Sideby Admin';
  ELSE
    -- For regular users, get name from profiles
    SELECT 
      COALESCE(first_name || ' ' || last_name, 'User') INTO sender_name
    FROM profiles 
    WHERE id = p_sender_id;
  END IF;
  
  -- Format content
  formatted_content := p_message_content;
  IF LENGTH(p_message_content) > 50 THEN
    formatted_content := SUBSTRING(p_message_content, 1, 50) || '...';
  END IF;
  
  -- Create email notification if user has email notifications enabled
  IF (notification_prefs->>'email')::boolean = true THEN
    INSERT INTO public.pending_notifications (
      user_id,
      notification_type,
      channel,
      title,
      content,
      data
    ) VALUES (
      p_receiver_id,
      'match_message',
      'email',
      'New message from ' || COALESCE(sender_name, 'your match'),
      formatted_content,
      jsonb_build_object('match_id', p_match_id, 'sender_name', sender_name)
    );
  END IF;
  
  -- Create SMS notification if user has SMS notifications enabled
  IF (notification_prefs->>'sms')::boolean = true THEN
    -- Only create SMS notifications if the user's phone is verified
    IF (SELECT phone_verified FROM profiles WHERE id = p_receiver_id) = true THEN
      INSERT INTO public.pending_notifications (
        user_id,
        notification_type,
        channel,
        title,
        content,
        data
      ) VALUES (
        p_receiver_id,
        'match_message',
        'sms',
        'New message',
        'From ' || COALESCE(sender_name, 'your match') || ': ' || formatted_content,
        jsonb_build_object('match_id', p_match_id, 'sender_name', sender_name)
      );
    END IF;
  END IF;
END;
$$;


--
-- Name: delete_user_account(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_user_account(user_id_param uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  match_ids UUID[];
BEGIN
  -- Get all match IDs where this user is involved to handle related tables
  SELECT array_agg(id) INTO match_ids
  FROM matches 
  WHERE user1_id = user_id_param 
     OR user2_id = user_id_param 
     OR created_by = user_id_param;

  -- Delete records from dependent tables in the correct order
  -- Match-related tables
  IF match_ids IS NOT NULL THEN
    DELETE FROM match_meeting_times WHERE match_id = ANY(match_ids);
    DELETE FROM match_scheduling_messages WHERE match_id = ANY(match_ids);
    DELETE FROM match_admin_messages WHERE match_id = ANY(match_ids);
    DELETE FROM match_conversation_analysis WHERE match_id = ANY(match_ids);
    DELETE FROM matches WHERE id = ANY(match_ids);
  END IF;

  -- Delete user's comments
  DELETE FROM comments WHERE user_id = user_id_param;
  
  -- Update user's posts to anonymize them instead of deleting
  -- This preserves community content while removing personal identifiers
  UPDATE posts 
  SET user_id = NULL,
      status = 'anonymous'
  WHERE user_id = user_id_param;
  
  -- Delete post visibility settings created by this user
  DELETE FROM post_visibility WHERE created_by = user_id_param;
  
  -- Delete user's connections
  DELETE FROM connections 
  WHERE user_id = user_id_param OR connected_user_id = user_id_param;
  
  -- Delete from all other related tables 
  DELETE FROM user_tools WHERE user_id = user_id_param;
  DELETE FROM user_pacing_preferences WHERE user_id = user_id_param;
  DELETE FROM user_roles WHERE user_id = user_id_param;
  DELETE FROM community_members WHERE user_id = user_id_param;
  DELETE FROM profile_experiments WHERE user_id = user_id_param;
  DELETE FROM user_availability WHERE user_id = user_id_param;
  DELETE FROM upduo_transcripts WHERE user_id = user_id_param;
  DELETE FROM values_acknowledgment WHERE id = user_id_param;
  DELETE FROM saved_items WHERE user_id = user_id_param;
  DELETE FROM engagement_logs WHERE user_id = user_id_param;
  DELETE FROM engagement_stats WHERE user_id = user_id_param;
  DELETE FROM user_custom_tools WHERE user_id = user_id_param;
  DELETE FROM user_session_schedules WHERE user_id = user_id_param;
  DELETE FROM sponsorships WHERE user_id = user_id_param;
  DELETE FROM resources WHERE user_id = user_id_param;
  DELETE FROM event_participants WHERE user_id = user_id_param;
  
  -- Process gaps - update rather than delete to maintain system integrity
  UPDATE process_gaps 
  SET created_by = NULL 
  WHERE created_by = user_id_param;
  
  UPDATE process_gaps 
  SET closed_by = NULL 
  WHERE closed_by = user_id_param;
  
  -- Finally delete the profile itself
  DELETE FROM profiles WHERE id = user_id_param;
  
  RETURN TRUE;
END;
$$;


--
-- Name: FUNCTION delete_user_account(user_id_param uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.delete_user_account(user_id_param uuid) IS 'Securely removes all user data from the system, anonymizing content where needed for platform integrity.';


--
-- Name: enforce_match_limit(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.enforce_match_limit() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  -- Check if the user creating the match is an admin
  IF public.is_sideby_admin(NEW.created_by) THEN
    -- Admin users can have up to 25 matches
    IF public.count_user_matches(NEW.user1_id) >= 25 OR public.count_user_matches(NEW.user2_id) >= 25 THEN
      RAISE EXCEPTION 'Maximum number of matches (25) reached for one of the users';
    END IF;
  ELSE
    -- Regular users can only have 1 match
    IF public.count_user_matches(NEW.user1_id) >= 1 OR public.count_user_matches(NEW.user2_id) >= 1 THEN
      RAISE EXCEPTION 'Maximum number of matches (1) reached for one of the users';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: get_community_members(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_community_members(community_id_param uuid) RETURNS TABLE(community_id uuid, first_name text, last_initial text, pacing_level text, role text, status text)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cm.community_id,
    p.first_name,
    SUBSTRING(p.last_name, 1, 1) AS last_initial,
    COALESCE(upp.pacing_level, 'not_set') AS pacing_level,
    COALESCE(ur.role, 'member') AS role,
    cm.status
  FROM 
    community_members cm
  JOIN 
    profiles p ON cm.user_id = p.id
  LEFT JOIN 
    user_roles ur ON cm.user_id = ur.user_id AND cm.community_id = ur.community_id
  LEFT JOIN 
    user_pacing_preferences upp ON cm.user_id = upp.user_id AND cm.community_id = upp.community_id
  WHERE 
    cm.community_id = community_id_param;
END;
$$;


--
-- Name: get_user_data(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_data(user_id uuid) RETURNS json
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select 
    json_build_object(
      'id', id,
      'email', email,
      'created_at', created_at,
      'updated_at', updated_at
    )
  from auth.users
  where id = user_id;
$$;


--
-- Name: get_user_last_signin(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_last_signin(user_id uuid) RETURNS timestamp with time zone
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT last_sign_in_at
  FROM auth.users
  WHERE id = user_id;
$$;


--
-- Name: get_weekly_session_counts(date, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_weekly_session_counts(start_date date, end_date date) RETURNS TABLE(week_start date, selected_sessions integer, kept_sessions integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE weeks AS (
        SELECT start_date AS week_start
        UNION ALL
        SELECT weeks.week_start + 7
        FROM weeks
        WHERE weeks.week_start + 7 <= end_date
    ),
    pacing_counts AS (
        SELECT 
            w.week_start,
            COUNT(DISTINCT CASE WHEN upp.pacing_level = 'light' THEN upp.user_id || ':' || upp.community_id END) * 1 as light_count,
            COUNT(DISTINCT CASE WHEN upp.pacing_level = 'moderate' THEN upp.user_id || ':' || upp.community_id END) * 2 as moderate_count,
            COUNT(DISTINCT CASE WHEN upp.pacing_level = 'consistent' THEN upp.user_id || ':' || upp.community_id END) * 4 as consistent_count,
            COUNT(DISTINCT CASE WHEN upp.pacing_level = 'deep_dive' THEN upp.user_id || ':' || upp.community_id END) * 12 as deep_dive_count
        FROM weeks w
        CROSS JOIN user_pacing_preferences upp
        GROUP BY w.week_start
    )
    SELECT 
        w.week_start,
        COALESCE(
            pc.light_count + 
            pc.moderate_count + 
            pc.consistent_count + 
            pc.deep_dive_count,
            0
        )::INTEGER as selected_sessions,
        (COALESCE(
            pc.light_count + 
            pc.moderate_count + 
            pc.consistent_count + 
            pc.deep_dive_count,
            0
        ) * 0.8)::INTEGER as kept_sessions
    FROM weeks w
    LEFT JOIN pacing_counts pc ON w.week_start = pc.week_start
    ORDER BY w.week_start;
END;
$$;


--
-- Name: handle_admin_message(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_admin_message() RETURNS trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
  admin_uuid UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
  -- Check if sender_type is explicitly set to 'admin'
  IF NEW.sender_type = 'admin' THEN
    -- Make sure sender_id is a valid UUID
    -- Note: We don't replace sender_id with admin_uuid anymore
    -- We keep the actual admin user's UUID but mark it with sender_type
    NULL;
  
  -- Legacy handling for old-style admin messages
  ELSIF NEW.sender_id::text LIKE '%@%' OR 
     NEW.sender_id::text = 'admin' OR 
     NEW.sender_id::text = 'robot@sideby' THEN
    -- Mark as admin message
    NEW.sender_type := 'admin';
    
    -- Only replace non-UUID sender_ids with placeholder
    IF NOT (NEW.sender_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') THEN
      NEW.sender_id := admin_uuid;
    END IF;
  END IF;
  RETURN NEW;
END;
$_$;


--
-- Name: handle_match_email(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_match_email() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  service_role_key text;
BEGIN
  -- Get the service role key from the secrets table
  SELECT decrypted_secret INTO service_role_key 
  FROM vault.decrypted_secrets 
  WHERE name = 'SUPABASE_SERVICE_ROLE_KEY';

  -- Call the match-email-webhook function to send emails to both users
  PERFORM
    net.http_post(
      url := 'https://upffcxqiozqhdgfesmji.supabase.co/functions/v1/match-email-webhook',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
      ),
      body := jsonb_build_object(
        'record', NEW
      )
    );
  
  RETURN NEW;
END;
$$;


--
-- Name: handle_new_admin_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_admin_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  IF NEW.email LIKE '%@sideby.ai' THEN
    INSERT INTO public.admin_users (id, role)
    VALUES (NEW.id, 'guide')
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: handle_new_chat_message(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_chat_message() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  service_role_key text;
BEGIN
  -- Get the service role key from the secrets table
  SELECT decrypted_secret INTO service_role_key 
  FROM vault.decrypted_secrets 
  WHERE name = 'SUPABASE_SERVICE_ROLE_KEY';

  -- Call the send-match-email function for new messages
  PERFORM
    net.http_post(
      url := 'https://upffcxqiozqhdgfesmji.supabase.co/functions/v1/send-match-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
      ),
      body := jsonb_build_object(
        'matchId', NEW.match_id,
        'senderId', NEW.sender_id,
        'content', NEW.content
      )
    );
  
  RETURN NEW;
END;
$$;


--
-- Name: handle_new_match_notification(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_match_notification() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  user1_name TEXT;
  user2_name TEXT;
BEGIN
  -- Get names for both users
  SELECT first_name INTO user1_name FROM public.profiles WHERE id = NEW.user1_id;
  SELECT first_name INTO user2_name FROM public.profiles WHERE id = NEW.user2_id;
  
  -- Create notification for user1
  INSERT INTO public.notifications (
    user_id, 
    type, 
    title, 
    content, 
    data
  ) VALUES (
    NEW.user1_id, 
    'match_created', 
    'New Learning Connection', 
    'You have been matched with ' || COALESCE(user2_name, 'another educator') || '. Go to your dashboard to connect!',
    jsonb_build_object('match_id', NEW.id, 'partner_id', NEW.user2_id, 'partner_name', user2_name)
  );
  
  -- Create notification for user2
  INSERT INTO public.notifications (
    user_id, 
    type, 
    title, 
    content, 
    data
  ) VALUES (
    NEW.user2_id, 
    'match_created', 
    'New Learning Connection', 
    'You have been matched with ' || COALESCE(user1_name, 'another educator') || '. Go to your dashboard to connect!',
    jsonb_build_object('match_id', NEW.id, 'partner_id', NEW.user1_id, 'partner_name', user1_name)
  );
  
  RETURN NEW;
END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, onboarding_completed)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    false
  );
  RETURN NEW;
END;
$$;


--
-- Name: handle_notification_request(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_notification_request() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  receiver_id UUID;
  match_info RECORD;
BEGIN
  -- Get match information
  SELECT * INTO match_info FROM matches WHERE id = NEW.match_id;
  
  -- Handle based on sender_type rather than sender_id format
  IF NEW.sender_type = 'admin' THEN
    -- If it's an admin message, notify both users
    -- Create notification for user1
    PERFORM create_notification_entry(
      match_info.user1_id, 
      NEW.sender_id, 
      NEW.content, 
      NEW.match_id
    );
    
    -- Create notification for user2
    PERFORM create_notification_entry(
      match_info.user2_id, 
      NEW.sender_id, 
      NEW.content, 
      NEW.match_id
    );
  ELSE
    -- For regular user messages, determine receiver
    IF NEW.sender_id = match_info.user1_id THEN
      receiver_id := match_info.user2_id;
    ELSE
      receiver_id := match_info.user1_id;
    END IF;
    
    -- Create notification for the receiver
    PERFORM create_notification_entry(
      receiver_id, 
      NEW.sender_id, 
      NEW.content, 
      NEW.match_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: handle_profile_deletion(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_profile_deletion() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  -- Mark all experiments for this user as deleted when profile is marked as deleted
  IF NEW.status = 'deleted' THEN
    UPDATE public.profile_experiments
    SET 
      status = 'deleted',
      is_deleted = true
    WHERE user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: handle_user_posts_deletion(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_user_posts_deletion(user_id_param uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  -- Update any posts by this user to have a null user_id and deleted status
  UPDATE public.posts 
  SET 
    status = 'deleted',
    user_id = NULL
  WHERE user_id = user_id_param;
  
  -- If we need to handle any other tables that reference posts, we would do it here
END;
$$;


--
-- Name: has_beta_feature(uuid, public.beta_feature); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_beta_feature(user_uuid uuid, feature_name public.beta_feature) RETURNS boolean
    LANGUAGE sql SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM beta_users
    WHERE user_id = user_uuid
    AND feature_name = ANY(features)
  );
$$;


--
-- Name: has_community_role(uuid, uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_community_role(user_id uuid, community_id uuid, role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    AS $_$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = $1 
    AND community_id = $2
    AND role = $3
  );
$_$;


--
-- Name: is_admin(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_admin(user_id uuid) RETURNS boolean
    LANGUAGE sql SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM admin_users
    WHERE id = user_id
  );
$$;


--
-- Name: is_phone_verified(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_phone_verified(user_id uuid) RETURNS boolean
    LANGUAGE sql SECURITY DEFINER
    AS $$
  SELECT COALESCE(phone_verified, FALSE) 
  FROM public.profiles 
  WHERE id = user_id;
$$;


--
-- Name: is_post_visible_to_user(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_post_visible_to_user(post_id uuid, user_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  post_status TEXT;
  visibility_settings RECORD;
  user_community_ids UUID[];
BEGIN
  -- Check if post exists and get its status
  SELECT status INTO post_status FROM public.posts WHERE id = post_id;
  
  -- If post is deleted, it's not visible unless the user is an admin
  IF post_status = 'deleted' THEN
    RETURN public.is_sideby_admin_from_profile(user_id);
  END IF;
  
  -- Get the user's communities
  SELECT array_agg(community_id) INTO user_community_ids 
  FROM public.community_members 
  WHERE user_id = user_id;
  
  -- Get visibility settings for this post
  SELECT * INTO visibility_settings 
  FROM public.post_visibility 
  WHERE post_id = post_id 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- If no visibility settings found, post is visible to everyone
  IF visibility_settings IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Check visibility type
  CASE visibility_settings.visibility_type
    WHEN 'hidden' THEN
      RETURN public.is_sideby_admin_from_profile(user_id);
    WHEN 'all' THEN
      -- Post visible to all except explicitly hidden users/communities
      RETURN NOT (
        user_id = ANY(visibility_settings.hidden_from_user_ids) OR 
        (visibility_settings.hidden_from_community_ids IS NOT NULL AND 
         visibility_settings.hidden_from_community_ids && user_community_ids)
      );
    WHEN 'specific_users' THEN
      -- Post visible only to specific users
      RETURN user_id = ANY(visibility_settings.visible_to_user_ids);
    WHEN 'specific_communities' THEN
      -- Post visible only to specific communities
      RETURN visibility_settings.visible_to_community_ids && user_community_ids;
    ELSE
      RETURN TRUE; -- Default to visible
  END CASE;
END;
$$;


--
-- Name: is_sideby_admin(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_sideby_admin(user_id uuid) RETURNS boolean
    LANGUAGE sql SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = user_id 
    AND email LIKE '%@sideby.ai'
  );
$$;


--
-- Name: is_sideby_admin_from_profile(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_sideby_admin_from_profile(user_id uuid) RETURNS boolean
    LANGUAGE sql SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = user_id 
    AND email LIKE '%@sideby.ai'
  );
$$;


--
-- Name: reject_hat_detection(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.reject_hat_detection(p_detection_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.hat_detections
  SET status = 'rejected', updated_at = now()
  WHERE id = p_detection_id;
  
  RETURN FOUND;
END;
$$;


--
-- Name: FUNCTION reject_hat_detection(p_detection_id uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.reject_hat_detection(p_detection_id uuid) IS 'Rejects a hat detection, marking it as rejected in the database.';


--
-- Name: remove_user_from_sideby(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.remove_user_from_sideby(user_email text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Get the user ID from the profiles table
  SELECT id INTO target_user_id
  FROM profiles
  WHERE email = user_email;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;

  -- Remove from match_scheduling_messages where this user is referenced
  DELETE FROM match_scheduling_messages 
  WHERE match_id IN (
    SELECT id FROM matches 
    WHERE user1_id = target_user_id 
    OR user2_id = target_user_id
    OR created_by = target_user_id
  );

  -- Remove from match_admin_messages where this user is referenced
  DELETE FROM match_admin_messages 
  WHERE match_id IN (
    SELECT id FROM matches 
    WHERE user1_id = target_user_id 
    OR user2_id = target_user_id
    OR created_by = target_user_id
  );

  -- Remove all matches where this user is involved
  DELETE FROM matches 
  WHERE user1_id = target_user_id 
  OR user2_id = target_user_id 
  OR created_by = target_user_id;

  -- Remove from all other related tables
  DELETE FROM user_tools WHERE user_id = target_user_id;
  DELETE FROM user_pacing_preferences WHERE user_id = target_user_id;
  DELETE FROM user_roles WHERE user_id = target_user_id;
  DELETE FROM community_members WHERE user_id = target_user_id;
  DELETE FROM profile_experiments WHERE user_id = target_user_id;
  DELETE FROM profiles WHERE id = target_user_id;
END;
$$;


--
-- Name: remove_user_from_sideby_improved(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.remove_user_from_sideby_improved(user_email text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  target_user_id UUID;
  match_ids UUID[];
BEGIN
  -- Get the user ID from the profiles table
  SELECT id INTO target_user_id
  FROM profiles
  WHERE email = user_email;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;

  -- Get all match IDs where this user is involved
  SELECT array_agg(id) INTO match_ids
  FROM matches 
  WHERE user1_id = target_user_id 
     OR user2_id = target_user_id 
     OR created_by = target_user_id;

  -- Delete records from dependent tables in the correct order
  
  -- First, delete match_meeting_times records
  IF match_ids IS NOT NULL THEN
    DELETE FROM match_meeting_times 
    WHERE match_id = ANY(match_ids);
  END IF;

  -- Then delete match_scheduling_messages
  IF match_ids IS NOT NULL THEN
    DELETE FROM match_scheduling_messages 
    WHERE match_id = ANY(match_ids);
  END IF;

  -- Then delete match_admin_messages
  IF match_ids IS NOT NULL THEN
    DELETE FROM match_admin_messages 
    WHERE match_id = ANY(match_ids);
  END IF;

  -- Delete match_conversation_analysis if it exists
  IF match_ids IS NOT NULL THEN
    DELETE FROM match_conversation_analysis
    WHERE match_id = ANY(match_ids);
  END IF;

  -- Now it's safe to delete the matches
  IF match_ids IS NOT NULL THEN
    DELETE FROM matches 
    WHERE id = ANY(match_ids);
  END IF;

  -- Remove from all other related tables
  DELETE FROM user_tools WHERE user_id = target_user_id;
  DELETE FROM user_pacing_preferences WHERE user_id = target_user_id;
  DELETE FROM user_roles WHERE user_id = target_user_id;
  DELETE FROM community_members WHERE user_id = target_user_id;
  DELETE FROM profile_experiments WHERE user_id = target_user_id;
  DELETE FROM user_availability WHERE user_id = target_user_id;
  DELETE FROM upduo_transcripts WHERE user_id = target_user_id;
  DELETE FROM values_acknowledgment WHERE id = target_user_id;
  
  -- Finally delete the profile
  DELETE FROM profiles WHERE id = target_user_id;
END;
$$;


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;


--
-- Name: set_updated_at_for_hat_metadata(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at_for_hat_metadata() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: set_updated_at_for_logs(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at_for_logs() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: set_updated_at_for_notifications(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at_for_notifications() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: set_updated_at_for_upduo_mappings(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at_for_upduo_mappings() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: set_updated_at_trigger_for_visibility(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at_trigger_for_visibility() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: sync_user_email(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sync_user_email() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  UPDATE public.profiles
  SET email = NEW.email
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;


--
-- Name: trigger_notification_digest(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trigger_notification_digest() RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  result json;
  request_id bigint;  -- Changed from text to bigint
  http_response record;
  service_role_key text;
BEGIN
  -- Get the service role key from secrets
  SELECT decrypted_secret INTO service_role_key 
  FROM vault.decrypted_secrets 
  WHERE name = 'SUPABASE_SERVICE_ROLE_KEY';

  -- Call the edge function and get request ID, casting result to bigint
  request_id := (SELECT (net.http_post(
    url := 'https://upffcxqiozqhdgfesmji.supabase.co/functions/v1/process-notification-digests',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := jsonb_build_object('manualTrigger', false, 'source', 'cron')
  ))::bigint);
  
  -- Wait a short time for response to be processed
  PERFORM pg_sleep(0.5);
  
  -- Get response using request_id with explicit bigint comparison
  SELECT status_code, content::json, error_msg INTO http_response
  FROM net._http_response
  WHERE id = request_id;

  -- If we got a response, return it
  IF http_response.status_code IS NOT NULL AND http_response.status_code BETWEEN 200 AND 299 THEN
    RETURN http_response.content;
  ELSE
    -- Return a basic result if no valid response or error
    RETURN json_build_object(
      'success', false, 
      'error', COALESCE(http_response.error_msg, 'No valid response received'),
      'status_code', http_response.status_code
    );
  END IF;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


--
-- Name: use_schema(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.use_schema(schema_name text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    EXECUTE format('SET search_path TO %I, public', schema_name);
END;
$$;


--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  BEGIN
    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (payload, event, topic, private, extension)
    VALUES (payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      PERFORM pg_notify(
          'realtime:system',
          jsonb_build_object(
              'error', SQLERRM,
              'function', 'realtime.send',
              'event', event,
              'topic', topic,
              'private', private
          )::text
      );
  END;
END;
$$;


--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
_filename text;
BEGIN
	select string_to_array(name, '/') into _parts;
	select _parts[array_length(_parts,1)] into _filename;
	-- @todo return the last part instead of 2
	return reverse(split_part(reverse(_filename), '.', 1));
END
$$;


--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[1:array_length(_parts,1)-1];
END
$$;


--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::int) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
  v_order_by text;
  v_sort_order text;
begin
  case
    when sortcolumn = 'name' then
      v_order_by = 'name';
    when sortcolumn = 'updated_at' then
      v_order_by = 'updated_at';
    when sortcolumn = 'created_at' then
      v_order_by = 'created_at';
    when sortcolumn = 'last_accessed_at' then
      v_order_by = 'last_accessed_at';
    else
      v_order_by = 'name';
  end case;

  case
    when sortorder = 'asc' then
      v_sort_order = 'asc';
    when sortorder = 'desc' then
      v_sort_order = 'desc';
    else
      v_sort_order = 'asc';
  end case;

  v_order_by = v_order_by || ' ' || v_sort_order;

  return query execute
    'with folders as (
       select path_tokens[$1] as folder
       from storage.objects
         where objects.name ilike $2 || $3 || ''%''
           and bucket_id = $4
           and array_length(objects.path_tokens, 1) <> $1
       group by folder
       order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


--
-- Name: http_request(); Type: FUNCTION; Schema: supabase_functions; Owner: -
--

CREATE FUNCTION supabase_functions.http_request() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'supabase_functions'
    AS $$
    DECLARE
      request_id bigint;
      payload jsonb;
      url text := TG_ARGV[0]::text;
      method text := TG_ARGV[1]::text;
      headers jsonb DEFAULT '{}'::jsonb;
      params jsonb DEFAULT '{}'::jsonb;
      timeout_ms integer DEFAULT 1000;
    BEGIN
      IF url IS NULL OR url = 'null' THEN
        RAISE EXCEPTION 'url argument is missing';
      END IF;

      IF method IS NULL OR method = 'null' THEN
        RAISE EXCEPTION 'method argument is missing';
      END IF;

      IF TG_ARGV[2] IS NULL OR TG_ARGV[2] = 'null' THEN
        headers = '{"Content-Type": "application/json"}'::jsonb;
      ELSE
        headers = TG_ARGV[2]::jsonb;
      END IF;

      IF TG_ARGV[3] IS NULL OR TG_ARGV[3] = 'null' THEN
        params = '{}'::jsonb;
      ELSE
        params = TG_ARGV[3]::jsonb;
      END IF;

      IF TG_ARGV[4] IS NULL OR TG_ARGV[4] = 'null' THEN
        timeout_ms = 1000;
      ELSE
        timeout_ms = TG_ARGV[4]::integer;
      END IF;

      CASE
        WHEN method = 'GET' THEN
          SELECT http_get INTO request_id FROM net.http_get(
            url,
            params,
            headers,
            timeout_ms
          );
        WHEN method = 'POST' THEN
          payload = jsonb_build_object(
            'old_record', OLD,
            'record', NEW,
            'type', TG_OP,
            'table', TG_TABLE_NAME,
            'schema', TG_TABLE_SCHEMA
          );

          SELECT http_post INTO request_id FROM net.http_post(
            url,
            payload,
            params,
            headers,
            timeout_ms
          );
        ELSE
          RAISE EXCEPTION 'method argument % is invalid', method;
      END CASE;

      INSERT INTO supabase_functions.hooks
        (hook_table_id, hook_name, request_id)
      VALUES
        (TG_RELID, TG_NAME, request_id);

      RETURN NEW;
    END
  $$;


--
-- Name: secrets_encrypt_secret_secret(); Type: FUNCTION; Schema: vault; Owner: -
--

CREATE FUNCTION vault.secrets_encrypt_secret_secret() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
		BEGIN
		        new.secret = CASE WHEN new.secret IS NULL THEN NULL ELSE
			CASE WHEN new.key_id IS NULL THEN NULL ELSE pg_catalog.encode(
			  pgsodium.crypto_aead_det_encrypt(
				pg_catalog.convert_to(new.secret, 'utf8'),
				pg_catalog.convert_to((new.id::text || new.description::text || new.created_at::text || new.updated_at::text)::text, 'utf8'),
				new.key_id::uuid,
				new.nonce
			  ),
				'base64') END END;
		RETURN new;
		END;
		$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid
);


--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text
);


--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: admin_alerts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_alerts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    match_id uuid NOT NULL,
    user_id uuid NOT NULL,
    content text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT admin_alerts_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'resolved'::text, 'dismissed'::text])))
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    data jsonb,
    read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    priority text DEFAULT 'normal'::text NOT NULL,
    channels jsonb DEFAULT '{"sms": false, "email": false, "in_app": true}'::jsonb,
    status text DEFAULT 'delivered'::text NOT NULL,
    deduplication_key text,
    processed_at timestamp with time zone,
    error text
);

ALTER TABLE ONLY public.notifications REPLICA IDENTITY FULL;


--
-- Name: admin_notification_metrics; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.admin_notification_metrics AS
 SELECT date_trunc('hour'::text, notifications.created_at) AS hour,
    notifications.type,
    notifications.priority,
    count(*) AS total_count,
    sum(
        CASE
            WHEN (notifications.status = 'delivered'::text) THEN 1
            ELSE 0
        END) AS delivered_count,
    sum(
        CASE
            WHEN (notifications.status = 'failed'::text) THEN 1
            ELSE 0
        END) AS failed_count,
    sum(
        CASE
            WHEN (notifications.error IS NOT NULL) THEN 1
            ELSE 0
        END) AS error_count
   FROM public.notifications
  GROUP BY (date_trunc('hour'::text, notifications.created_at)), notifications.type, notifications.priority
  ORDER BY (date_trunc('hour'::text, notifications.created_at)) DESC;


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    first_name text,
    last_name text,
    bio text,
    teaching_experience text,
    subjects text[],
    certifications text[],
    avatar_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    subject_statuses jsonb[] DEFAULT ARRAY[]::jsonb[],
    email text NOT NULL,
    email_preferences jsonb DEFAULT '{"chat_notifications": true}'::jsonb,
    approved_stance text,
    impersonating_user_id uuid,
    status text DEFAULT 'active'::text NOT NULL,
    deleted_at timestamp with time zone,
    onboarding_completed boolean DEFAULT false NOT NULL,
    phone_number text,
    notification_preferences jsonb DEFAULT '{"sms": false, "email": true, "in_app": true}'::jsonb,
    phone_verified boolean DEFAULT false,
    phone_verification_code text,
    phone_verification_sent_at timestamp with time zone,
    approved_flow_activity text,
    has_completed_reflection boolean DEFAULT false
);


--
-- Name: COLUMN profiles.has_completed_reflection; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.profiles.has_completed_reflection IS 'Manually set flag for users who have completed reflection';


--
-- Name: user_availability; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_availability (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    time_slots jsonb DEFAULT '[]'::jsonb NOT NULL,
    pacing_level text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: admin_user_availability_view; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.admin_user_availability_view AS
 SELECT ua.id,
    ua.user_id,
    p.first_name,
    p.last_name,
    p.email,
    ua.pacing_level,
    ua.time_slots,
    ua.created_at,
    ua.updated_at
   FROM (public.user_availability ua
     JOIN public.profiles p ON ((ua.user_id = p.id)))
  WHERE public.is_sideby_admin_from_profile(auth.uid());


--
-- Name: admin_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_users (
    id uuid NOT NULL,
    role public.admin_role DEFAULT 'guide'::public.admin_role NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: beta_user_pending_emails; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.beta_user_pending_emails (
    email text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: beta_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.beta_users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    features public.beta_feature[] DEFAULT ARRAY[]::public.beta_feature[],
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    user_id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: communities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.communities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: community_feature_flags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.community_feature_flags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    community_id uuid NOT NULL,
    feature_name text NOT NULL,
    description text,
    enabled boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: community_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.community_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    community_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: community_pacing; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.community_pacing (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    community_id uuid NOT NULL,
    light_description text DEFAULT 'Monthly engagement with casual participation'::text,
    moderate_description text DEFAULT 'Biweekly participation with regular involvement'::text,
    consistent_description text DEFAULT 'Weekly participation with steady involvement'::text,
    deep_dive_description text DEFAULT 'Thrice weekly participation with high commitment'::text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: engagement_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.engagement_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    community_id uuid NOT NULL,
    engagement_type text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    metadata jsonb
);


--
-- Name: engagement_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.engagement_stats (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    community_id uuid,
    planned_sessions integer DEFAULT 0 NOT NULL,
    completed_sessions integer DEFAULT 0 NOT NULL,
    current_streak integer DEFAULT 0 NOT NULL,
    last_engagement_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: global_feature_flags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.global_feature_flags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    feature_name text NOT NULL,
    description text,
    enabled boolean DEFAULT false NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: hat_detections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hat_detections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    hat_name text NOT NULL,
    source text DEFAULT 'session_transcript'::text NOT NULL,
    confidence double precision,
    session_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT valid_status CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])))
);


--
-- Name: hat_embeddings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hat_embeddings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    hat_name text NOT NULL,
    embedding public.vector(1536),
    updated_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: hat_inference_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hat_inference_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    original_hat text NOT NULL,
    session_id text,
    status text DEFAULT 'pending'::text NOT NULL,
    result text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: hat_metadata; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hat_metadata (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    hat_name text NOT NULL,
    source text DEFAULT 'manual'::text NOT NULL,
    session_id text,
    confidence double precision,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: hat_similarity_cache; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hat_similarity_cache (
    hat1 text NOT NULL,
    hat2 text NOT NULL,
    similarity double precision NOT NULL,
    updated_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: match_admin_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.match_admin_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    match_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE ONLY public.match_admin_messages REPLICA IDENTITY FULL;


--
-- Name: match_conversation_analysis; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.match_conversation_analysis (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    match_id uuid NOT NULL,
    content text NOT NULL,
    analysis_type public.match_analysis_type NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: match_meeting_times; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.match_meeting_times (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    match_id uuid NOT NULL,
    detected_time timestamp with time zone NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT match_meeting_times_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'rejected'::text])))
);


--
-- Name: match_scheduling_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.match_scheduling_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    match_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    sender_type text DEFAULT 'user'::text,
    timezone text
);

ALTER TABLE ONLY public.match_scheduling_messages REPLICA IDENTITY FULL;


--
-- Name: COLUMN match_scheduling_messages.timezone; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.match_scheduling_messages.timezone IS 'User timezone when the message was sent, for proper time conversion in scheduling messages';


--
-- Name: matches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.matches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user1_id uuid NOT NULL,
    user2_id uuid NOT NULL,
    rationale text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid NOT NULL,
    email_sent_at timestamp with time zone,
    status text DEFAULT 'active'::text NOT NULL,
    completion_notes text,
    completed_at timestamp with time zone,
    completed_by uuid,
    upduo_session_id text,
    upduo_session_name text,
    CONSTRAINT different_users CHECK ((user1_id <> user2_id)),
    CONSTRAINT matches_status_check CHECK ((status = ANY (ARRAY['active'::text, 'completed'::text, 'cancelled'::text])))
);

ALTER TABLE ONLY public.matches REPLICA IDENTITY FULL;


--
-- Name: notification_delivery_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_delivery_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    notification_id uuid NOT NULL,
    channel text NOT NULL,
    success boolean DEFAULT false NOT NULL,
    attempt_count integer DEFAULT 1 NOT NULL,
    last_attempt_at timestamp with time zone DEFAULT now() NOT NULL,
    error text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    source_table text DEFAULT 'notifications'::text NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT notification_delivery_logs_channel_check CHECK ((channel = ANY (ARRAY['email'::text, 'sms'::text, 'in_app'::text, 'cron_trigger'::text, 'edge_function'::text])))
);


--
-- Name: pending_match_announcements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pending_match_announcements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    match_id uuid NOT NULL,
    user1_id uuid NOT NULL,
    user2_id uuid NOT NULL,
    scheduled_for timestamp with time zone NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: pending_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pending_notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    notification_type text NOT NULL,
    channel text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    data jsonb,
    created_at timestamp with time zone DEFAULT now(),
    processed_at timestamp with time zone,
    status text DEFAULT 'pending'::text NOT NULL
);


--
-- Name: post_visibility; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.post_visibility (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    visibility_type text NOT NULL,
    visible_to_user_ids uuid[],
    visible_to_community_ids uuid[],
    hidden_from_user_ids uuid[],
    hidden_from_community_ids uuid[],
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid NOT NULL,
    CONSTRAINT post_visibility_visibility_type_check CHECK ((visibility_type = ANY (ARRAY['all'::text, 'specific_users'::text, 'specific_communities'::text, 'hidden'::text])))
);


--
-- Name: posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    content text NOT NULL,
    type text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    experiment_id uuid,
    metadata jsonb,
    image_url text,
    generated_idea text,
    status text DEFAULT 'active'::text NOT NULL,
    match_id uuid,
    CONSTRAINT posts_status_check CHECK ((status = ANY (ARRAY['active'::text, 'deleted'::text]))),
    CONSTRAINT posts_type_check CHECK ((type = ANY (ARRAY['text'::text, 'resource'::text, 'lesson'::text, 'ai_trick'::text, 'upduo_reflection'::text, 'experiment_stance'::text])))
);


--
-- Name: COLUMN posts.metadata; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.posts.metadata IS 'Optional metadata like song links in format: {"song_link": "url"}';


--
-- Name: process_gaps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.process_gaps (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    description text NOT NULL,
    status public.gap_status DEFAULT 'open'::public.gap_status,
    created_by uuid NOT NULL,
    closed_by uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    closed_at timestamp with time zone
);


--
-- Name: profile_experiments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profile_experiments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    suggested_hats text[] DEFAULT ARRAY[]::text[],
    stance_statement text,
    primary_flow_activity text,
    learning_focus text[],
    teaching_focus text[],
    analyzed_transcript text,
    source_type text NOT NULL,
    confidence_score double precision,
    is_second_opinion boolean DEFAULT false,
    experiment_type text DEFAULT 'stance_from_welcome'::text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    excitement_areas text[],
    caution_areas text[],
    moment_of_brilliance text,
    is_deleted boolean DEFAULT false NOT NULL,
    created_by uuid,
    CONSTRAINT valid_experiment_types CHECK ((experiment_type = ANY (ARRAY['stance_from_welcome'::text, 'guts_vs_fear'::text])))
);


--
-- Name: COLUMN profile_experiments.experiment_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.profile_experiments.experiment_type IS 'Valid types: stance_from_welcome, guts_vs_fear';


--
-- Name: saved_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.saved_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    original_post_id uuid,
    content text NOT NULL,
    type public.saved_item_type NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    excitement_level smallint,
    alignment_level smallint
);

ALTER TABLE ONLY public.saved_items REPLICA IDENTITY FULL;


--
-- Name: sponsorships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sponsorships (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    tool_name text NOT NULL,
    store text NOT NULL,
    district text NOT NULL,
    region text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: tools; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tools (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    type public.tool_type NOT NULL,
    description text,
    url text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    price_per_month numeric(10,2),
    status text DEFAULT 'active'::text NOT NULL
);


--
-- Name: upduo_session_schedules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.upduo_session_schedules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    pacing_level public.pacing_level NOT NULL,
    frequency text NOT NULL,
    description text NOT NULL
);


--
-- Name: upduo_transcripts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.upduo_transcripts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    conversation_id text NOT NULL,
    transcript jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    metadata jsonb
);


--
-- Name: upduo_user_associations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.upduo_user_associations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upduo_user_id text NOT NULL,
    sideby_user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: TABLE upduo_user_associations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.upduo_user_associations IS 'Stores associations between upduo user IDs and Sideby user IDs';


--
-- Name: upduo_user_mappings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.upduo_user_mappings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upduo_user_id text NOT NULL,
    sideby_user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_custom_tools; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_custom_tools (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    url text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_flow_activities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_flow_activities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    session_id text NOT NULL,
    flow_activity text,
    confidence double precision,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_pacing_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_pacing_preferences (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    community_id uuid NOT NULL,
    pacing_level text DEFAULT 'moderate'::public.pacing_level NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    session_time public.session_time DEFAULT '12PM'::public.session_time,
    status text DEFAULT 'active'::text NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: user_pacing_preferences_with_names; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.user_pacing_preferences_with_names AS
 SELECT upp.id,
    upp.user_id,
    upp.community_id,
    upp.pacing_level,
    upp.created_at,
    upp.updated_at,
    upp.session_time,
    p.first_name
   FROM (public.user_pacing_preferences upp
     JOIN public.profiles p ON ((p.id = upp.user_id)));


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    community_id uuid NOT NULL,
    role public.app_role DEFAULT 'member'::public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: user_session_schedules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_session_schedules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    frequency public.session_frequency NOT NULL,
    start_week date NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: user_tools; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_tools (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    tool_id uuid NOT NULL,
    assigned_by uuid NOT NULL,
    assigned_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: values_acknowledgment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.values_acknowledgment (
    id uuid NOT NULL,
    acknowledged_at timestamp with time zone DEFAULT now()
);


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


--
-- Name: messages_2025_04_24; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_04_24 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_04_25; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_04_25 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_04_26; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_04_26 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_04_27; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_04_27 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_04_28; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_04_28 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_04_29; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_04_29 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_04_30; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_04_30 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_05_01; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_05_01 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_05_02; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_05_02 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_05_03; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_05_03 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_05_04; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_05_04 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: -
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text
);


--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: objects; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb
);


--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: hooks; Type: TABLE; Schema: supabase_functions; Owner: -
--

CREATE TABLE supabase_functions.hooks (
    id bigint NOT NULL,
    hook_table_id integer NOT NULL,
    hook_name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    request_id bigint
);


--
-- Name: TABLE hooks; Type: COMMENT; Schema: supabase_functions; Owner: -
--

COMMENT ON TABLE supabase_functions.hooks IS 'Supabase Functions Hooks: Audit trail for triggered hooks.';


--
-- Name: hooks_id_seq; Type: SEQUENCE; Schema: supabase_functions; Owner: -
--

CREATE SEQUENCE supabase_functions.hooks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: hooks_id_seq; Type: SEQUENCE OWNED BY; Schema: supabase_functions; Owner: -
--

ALTER SEQUENCE supabase_functions.hooks_id_seq OWNED BY supabase_functions.hooks.id;


--
-- Name: migrations; Type: TABLE; Schema: supabase_functions; Owner: -
--

CREATE TABLE supabase_functions.migrations (
    version text NOT NULL,
    inserted_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: supabase_migrations; Owner: -
--

CREATE TABLE supabase_migrations.schema_migrations (
    version text NOT NULL,
    statements text[],
    name text,
    created_by text
);


--
-- Name: seed_files; Type: TABLE; Schema: supabase_migrations; Owner: -
--

CREATE TABLE supabase_migrations.seed_files (
    path text NOT NULL,
    hash text NOT NULL
);


--
-- Name: admin_users; Type: TABLE; Schema: testing; Owner: -
--

CREATE TABLE testing.admin_users (
    id uuid NOT NULL,
    role public.admin_role DEFAULT 'guide'::public.admin_role NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: comments; Type: TABLE; Schema: testing; Owner: -
--

CREATE TABLE testing.comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    user_id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: communities; Type: TABLE; Schema: testing; Owner: -
--

CREATE TABLE testing.communities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: community_members; Type: TABLE; Schema: testing; Owner: -
--

CREATE TABLE testing.community_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    community_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: community_pacing; Type: TABLE; Schema: testing; Owner: -
--

CREATE TABLE testing.community_pacing (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    community_id uuid NOT NULL,
    light_description text DEFAULT 'Monthly engagement with casual participation'::text,
    moderate_description text DEFAULT 'Biweekly participation with regular involvement'::text,
    consistent_description text DEFAULT 'Weekly participation with steady involvement'::text,
    deep_dive_description text DEFAULT 'Thrice weekly participation with high commitment'::text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: connections; Type: TABLE; Schema: testing; Owner: -
--

CREATE TABLE testing.connections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    connected_user_id uuid NOT NULL,
    status text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT connections_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text])))
);


--
-- Name: engagement_logs; Type: TABLE; Schema: testing; Owner: -
--

CREATE TABLE testing.engagement_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    community_id uuid NOT NULL,
    engagement_type text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: match_scheduling_messages; Type: TABLE; Schema: testing; Owner: -
--

CREATE TABLE testing.match_scheduling_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    match_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: matches; Type: TABLE; Schema: testing; Owner: -
--

CREATE TABLE testing.matches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user1_id uuid NOT NULL,
    user2_id uuid NOT NULL,
    rationale text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid NOT NULL,
    email_sent_at timestamp with time zone,
    CONSTRAINT different_users CHECK ((user1_id <> user2_id))
);


--
-- Name: posts; Type: TABLE; Schema: testing; Owner: -
--

CREATE TABLE testing.posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    content text NOT NULL,
    type text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT posts_type_check CHECK ((type = ANY (ARRAY['text'::text, 'resource'::text, 'lesson'::text, 'ai_trick'::text])))
);


--
-- Name: process_gaps; Type: TABLE; Schema: testing; Owner: -
--

CREATE TABLE testing.process_gaps (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    description text NOT NULL,
    status public.gap_status DEFAULT 'open'::public.gap_status,
    created_by uuid NOT NULL,
    closed_by uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    closed_at timestamp with time zone
);


--
-- Name: profiles; Type: TABLE; Schema: testing; Owner: -
--

CREATE TABLE testing.profiles (
    id uuid NOT NULL,
    first_name text,
    last_name text,
    bio text,
    teaching_experience text,
    subjects text[],
    certifications text[],
    avatar_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    subject_statuses jsonb[] DEFAULT ARRAY[]::jsonb[],
    email text
);


--
-- Name: resources; Type: TABLE; Schema: testing; Owner: -
--

CREATE TABLE testing.resources (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    type text NOT NULL,
    url text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT resources_type_check CHECK ((type = ANY (ARRAY['document'::text, 'link'::text, 'template'::text])))
);


--
-- Name: saved_items; Type: TABLE; Schema: testing; Owner: -
--

CREATE TABLE testing.saved_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    original_post_id uuid,
    content text NOT NULL,
    type public.saved_item_type NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: sponsorships; Type: TABLE; Schema: testing; Owner: -
--

CREATE TABLE testing.sponsorships (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    tool_name text NOT NULL,
    store text NOT NULL,
    district text NOT NULL,
    region text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: tools; Type: TABLE; Schema: testing; Owner: -
--

CREATE TABLE testing.tools (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    type public.tool_type NOT NULL,
    description text,
    url text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    price_per_month numeric(10,2),
    status text DEFAULT 'active'::text NOT NULL
);


--
-- Name: upduo_session_schedules; Type: TABLE; Schema: testing; Owner: -
--

CREATE TABLE testing.upduo_session_schedules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    pacing_level public.pacing_level NOT NULL,
    frequency text NOT NULL,
    description text NOT NULL
);


--
-- Name: user_pacing_preferences; Type: TABLE; Schema: testing; Owner: -
--

CREATE TABLE testing.user_pacing_preferences (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    community_id uuid NOT NULL,
    pacing_level public.pacing_level DEFAULT 'moderate'::public.pacing_level NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    session_time public.session_time DEFAULT '12PM'::public.session_time
);


--
-- Name: user_roles; Type: TABLE; Schema: testing; Owner: -
--

CREATE TABLE testing.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    community_id uuid NOT NULL,
    role public.app_role DEFAULT 'member'::public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: user_session_schedules; Type: TABLE; Schema: testing; Owner: -
--

CREATE TABLE testing.user_session_schedules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    frequency public.session_frequency NOT NULL,
    start_week date NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: user_tools; Type: TABLE; Schema: testing; Owner: -
--

CREATE TABLE testing.user_tools (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    tool_id uuid NOT NULL,
    assigned_by uuid NOT NULL,
    assigned_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: values_acknowledgment; Type: TABLE; Schema: testing; Owner: -
--

CREATE TABLE testing.values_acknowledgment (
    id uuid NOT NULL,
    acknowledged_at timestamp with time zone DEFAULT now()
);


--
-- Name: decrypted_secrets; Type: VIEW; Schema: vault; Owner: -
--

CREATE VIEW vault.decrypted_secrets AS
 SELECT secrets.id,
    secrets.name,
    secrets.description,
    secrets.secret,
        CASE
            WHEN (secrets.secret IS NULL) THEN NULL::text
            ELSE
            CASE
                WHEN (secrets.key_id IS NULL) THEN NULL::text
                ELSE convert_from(pgsodium.crypto_aead_det_decrypt(decode(secrets.secret, 'base64'::text), convert_to(((((secrets.id)::text || secrets.description) || (secrets.created_at)::text) || (secrets.updated_at)::text), 'utf8'::name), secrets.key_id, secrets.nonce), 'utf8'::name)
            END
        END AS decrypted_secret,
    secrets.key_id,
    secrets.nonce,
    secrets.created_at,
    secrets.updated_at
   FROM vault.secrets;


--
-- Name: messages_2025_04_24; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_04_24 FOR VALUES FROM ('2025-04-24 00:00:00') TO ('2025-04-25 00:00:00');


--
-- Name: messages_2025_04_25; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_04_25 FOR VALUES FROM ('2025-04-25 00:00:00') TO ('2025-04-26 00:00:00');


--
-- Name: messages_2025_04_26; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_04_26 FOR VALUES FROM ('2025-04-26 00:00:00') TO ('2025-04-27 00:00:00');


--
-- Name: messages_2025_04_27; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_04_27 FOR VALUES FROM ('2025-04-27 00:00:00') TO ('2025-04-28 00:00:00');


--
-- Name: messages_2025_04_28; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_04_28 FOR VALUES FROM ('2025-04-28 00:00:00') TO ('2025-04-29 00:00:00');


--
-- Name: messages_2025_04_29; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_04_29 FOR VALUES FROM ('2025-04-29 00:00:00') TO ('2025-04-30 00:00:00');


--
-- Name: messages_2025_04_30; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_04_30 FOR VALUES FROM ('2025-04-30 00:00:00') TO ('2025-05-01 00:00:00');


--
-- Name: messages_2025_05_01; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_05_01 FOR VALUES FROM ('2025-05-01 00:00:00') TO ('2025-05-02 00:00:00');


--
-- Name: messages_2025_05_02; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_05_02 FOR VALUES FROM ('2025-05-02 00:00:00') TO ('2025-05-03 00:00:00');


--
-- Name: messages_2025_05_03; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_05_03 FOR VALUES FROM ('2025-05-03 00:00:00') TO ('2025-05-04 00:00:00');


--
-- Name: messages_2025_05_04; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_05_04 FOR VALUES FROM ('2025-05-04 00:00:00') TO ('2025-05-05 00:00:00');


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: hooks id; Type: DEFAULT; Schema: supabase_functions; Owner: -
--

ALTER TABLE ONLY supabase_functions.hooks ALTER COLUMN id SET DEFAULT nextval('supabase_functions.hooks_id_seq'::regclass);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: admin_alerts admin_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_alerts
    ADD CONSTRAINT admin_alerts_pkey PRIMARY KEY (id);


--
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- Name: beta_user_pending_emails beta_user_pending_emails_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beta_user_pending_emails
    ADD CONSTRAINT beta_user_pending_emails_pkey PRIMARY KEY (email);


--
-- Name: beta_users beta_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beta_users
    ADD CONSTRAINT beta_users_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: communities communities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communities
    ADD CONSTRAINT communities_pkey PRIMARY KEY (id);


--
-- Name: community_feature_flags community_feature_flags_community_id_feature_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_feature_flags
    ADD CONSTRAINT community_feature_flags_community_id_feature_name_key UNIQUE (community_id, feature_name);


--
-- Name: community_feature_flags community_feature_flags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_feature_flags
    ADD CONSTRAINT community_feature_flags_pkey PRIMARY KEY (id);


--
-- Name: community_members community_members_community_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_members
    ADD CONSTRAINT community_members_community_id_user_id_key UNIQUE (community_id, user_id);


--
-- Name: community_members community_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_members
    ADD CONSTRAINT community_members_pkey PRIMARY KEY (id);


--
-- Name: community_pacing community_pacing_community_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_pacing
    ADD CONSTRAINT community_pacing_community_id_key UNIQUE (community_id);


--
-- Name: community_pacing community_pacing_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_pacing
    ADD CONSTRAINT community_pacing_pkey PRIMARY KEY (id);


--
-- Name: engagement_logs engagement_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.engagement_logs
    ADD CONSTRAINT engagement_logs_pkey PRIMARY KEY (id);


--
-- Name: engagement_stats engagement_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.engagement_stats
    ADD CONSTRAINT engagement_stats_pkey PRIMARY KEY (id);


--
-- Name: engagement_stats engagement_stats_user_id_community_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.engagement_stats
    ADD CONSTRAINT engagement_stats_user_id_community_id_key UNIQUE (user_id, community_id);


--
-- Name: global_feature_flags global_feature_flags_feature_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.global_feature_flags
    ADD CONSTRAINT global_feature_flags_feature_name_key UNIQUE (feature_name);


--
-- Name: global_feature_flags global_feature_flags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.global_feature_flags
    ADD CONSTRAINT global_feature_flags_pkey PRIMARY KEY (id);


--
-- Name: hat_detections hat_detections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hat_detections
    ADD CONSTRAINT hat_detections_pkey PRIMARY KEY (id);


--
-- Name: hat_embeddings hat_embeddings_hat_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hat_embeddings
    ADD CONSTRAINT hat_embeddings_hat_name_key UNIQUE (hat_name);


--
-- Name: hat_embeddings hat_embeddings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hat_embeddings
    ADD CONSTRAINT hat_embeddings_pkey PRIMARY KEY (id);


--
-- Name: hat_inference_requests hat_inference_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hat_inference_requests
    ADD CONSTRAINT hat_inference_requests_pkey PRIMARY KEY (id);


--
-- Name: hat_metadata hat_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hat_metadata
    ADD CONSTRAINT hat_metadata_pkey PRIMARY KEY (id);


--
-- Name: hat_similarity_cache hat_similarity_cache_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hat_similarity_cache
    ADD CONSTRAINT hat_similarity_cache_pkey PRIMARY KEY (hat1, hat2);


--
-- Name: match_admin_messages match_admin_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_admin_messages
    ADD CONSTRAINT match_admin_messages_pkey PRIMARY KEY (id);


--
-- Name: match_conversation_analysis match_conversation_analysis_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_conversation_analysis
    ADD CONSTRAINT match_conversation_analysis_pkey PRIMARY KEY (id);


--
-- Name: match_meeting_times match_meeting_times_match_id_detected_time_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_meeting_times
    ADD CONSTRAINT match_meeting_times_match_id_detected_time_key UNIQUE (match_id, detected_time);


--
-- Name: match_meeting_times match_meeting_times_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_meeting_times
    ADD CONSTRAINT match_meeting_times_pkey PRIMARY KEY (id);


--
-- Name: match_scheduling_messages match_scheduling_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_scheduling_messages
    ADD CONSTRAINT match_scheduling_messages_pkey PRIMARY KEY (id);


--
-- Name: matches matches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_pkey PRIMARY KEY (id);


--
-- Name: notification_delivery_logs notification_delivery_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_delivery_logs
    ADD CONSTRAINT notification_delivery_logs_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: pending_match_announcements pending_match_announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pending_match_announcements
    ADD CONSTRAINT pending_match_announcements_pkey PRIMARY KEY (id);


--
-- Name: pending_notifications pending_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pending_notifications
    ADD CONSTRAINT pending_notifications_pkey PRIMARY KEY (id);


--
-- Name: post_visibility post_visibility_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_visibility
    ADD CONSTRAINT post_visibility_pkey PRIMARY KEY (id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: process_gaps process_gaps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.process_gaps
    ADD CONSTRAINT process_gaps_pkey PRIMARY KEY (id);


--
-- Name: profile_experiments profile_experiments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_experiments
    ADD CONSTRAINT profile_experiments_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: saved_items saved_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_items
    ADD CONSTRAINT saved_items_pkey PRIMARY KEY (id);


--
-- Name: sponsorships sponsorships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sponsorships
    ADD CONSTRAINT sponsorships_pkey PRIMARY KEY (id);


--
-- Name: tools tools_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tools
    ADD CONSTRAINT tools_pkey PRIMARY KEY (id);


--
-- Name: upduo_session_schedules upduo_session_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.upduo_session_schedules
    ADD CONSTRAINT upduo_session_schedules_pkey PRIMARY KEY (id);


--
-- Name: upduo_transcripts upduo_transcripts_conversation_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.upduo_transcripts
    ADD CONSTRAINT upduo_transcripts_conversation_id_key UNIQUE (user_id, conversation_id);


--
-- Name: upduo_transcripts upduo_transcripts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.upduo_transcripts
    ADD CONSTRAINT upduo_transcripts_pkey PRIMARY KEY (id);


--
-- Name: upduo_user_associations upduo_user_associations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.upduo_user_associations
    ADD CONSTRAINT upduo_user_associations_pkey PRIMARY KEY (id);


--
-- Name: upduo_user_associations upduo_user_associations_upduo_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.upduo_user_associations
    ADD CONSTRAINT upduo_user_associations_upduo_user_id_key UNIQUE (upduo_user_id);


--
-- Name: upduo_user_mappings upduo_user_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.upduo_user_mappings
    ADD CONSTRAINT upduo_user_mappings_pkey PRIMARY KEY (id);


--
-- Name: upduo_user_mappings upduo_user_mappings_upduo_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.upduo_user_mappings
    ADD CONSTRAINT upduo_user_mappings_upduo_user_id_key UNIQUE (upduo_user_id);


--
-- Name: user_availability user_availability_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_availability
    ADD CONSTRAINT user_availability_pkey PRIMARY KEY (id);


--
-- Name: user_custom_tools user_custom_tools_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_custom_tools
    ADD CONSTRAINT user_custom_tools_pkey PRIMARY KEY (id);


--
-- Name: user_flow_activities user_flow_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_flow_activities
    ADD CONSTRAINT user_flow_activities_pkey PRIMARY KEY (id);


--
-- Name: user_flow_activities user_flow_activities_user_id_session_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_flow_activities
    ADD CONSTRAINT user_flow_activities_user_id_session_id_key UNIQUE (user_id, session_id);


--
-- Name: user_pacing_preferences user_pacing_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_pacing_preferences
    ADD CONSTRAINT user_pacing_preferences_pkey PRIMARY KEY (id);


--
-- Name: user_pacing_preferences user_pacing_preferences_user_id_community_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_pacing_preferences
    ADD CONSTRAINT user_pacing_preferences_user_id_community_id_key UNIQUE (user_id, community_id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_community_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_community_id_key UNIQUE (user_id, community_id);


--
-- Name: user_session_schedules user_session_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_session_schedules
    ADD CONSTRAINT user_session_schedules_pkey PRIMARY KEY (id);


--
-- Name: user_tools user_tools_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_tools
    ADD CONSTRAINT user_tools_pkey PRIMARY KEY (id);


--
-- Name: user_tools user_tools_user_id_tool_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_tools
    ADD CONSTRAINT user_tools_user_id_tool_id_key UNIQUE (user_id, tool_id);


--
-- Name: values_acknowledgment values_acknowledgment_user_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.values_acknowledgment
    ADD CONSTRAINT values_acknowledgment_user_unique PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_04_24 messages_2025_04_24_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_04_24
    ADD CONSTRAINT messages_2025_04_24_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_04_25 messages_2025_04_25_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_04_25
    ADD CONSTRAINT messages_2025_04_25_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_04_26 messages_2025_04_26_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_04_26
    ADD CONSTRAINT messages_2025_04_26_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_04_27 messages_2025_04_27_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_04_27
    ADD CONSTRAINT messages_2025_04_27_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_04_28 messages_2025_04_28_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_04_28
    ADD CONSTRAINT messages_2025_04_28_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_04_29 messages_2025_04_29_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_04_29
    ADD CONSTRAINT messages_2025_04_29_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_04_30 messages_2025_04_30_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_04_30
    ADD CONSTRAINT messages_2025_04_30_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_05_01 messages_2025_05_01_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_05_01
    ADD CONSTRAINT messages_2025_05_01_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_05_02 messages_2025_05_02_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_05_02
    ADD CONSTRAINT messages_2025_05_02_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_05_03 messages_2025_05_03_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_05_03
    ADD CONSTRAINT messages_2025_05_03_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_05_04 messages_2025_05_04_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_05_04
    ADD CONSTRAINT messages_2025_05_04_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: hooks hooks_pkey; Type: CONSTRAINT; Schema: supabase_functions; Owner: -
--

ALTER TABLE ONLY supabase_functions.hooks
    ADD CONSTRAINT hooks_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: supabase_functions; Owner: -
--

ALTER TABLE ONLY supabase_functions.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (version);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: seed_files seed_files_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.seed_files
    ADD CONSTRAINT seed_files_pkey PRIMARY KEY (path);


--
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: testing; Owner: -
--

ALTER TABLE ONLY testing.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: testing; Owner: -
--

ALTER TABLE ONLY testing.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: communities communities_pkey; Type: CONSTRAINT; Schema: testing; Owner: -
--

ALTER TABLE ONLY testing.communities
    ADD CONSTRAINT communities_pkey PRIMARY KEY (id);


--
-- Name: community_members community_members_community_id_user_id_key; Type: CONSTRAINT; Schema: testing; Owner: -
--

ALTER TABLE ONLY testing.community_members
    ADD CONSTRAINT community_members_community_id_user_id_key UNIQUE (community_id, user_id);


--
-- Name: community_members community_members_pkey; Type: CONSTRAINT; Schema: testing; Owner: -
--

ALTER TABLE ONLY testing.community_members
    ADD CONSTRAINT community_members_pkey PRIMARY KEY (id);


--
-- Name: community_pacing community_pacing_community_id_key; Type: CONSTRAINT; Schema: testing; Owner: -
--

ALTER TABLE ONLY testing.community_pacing
    ADD CONSTRAINT community_pacing_community_id_key UNIQUE (community_id);


--
-- Name: community_pacing community_pacing_pkey; Type: CONSTRAINT; Schema: testing; Owner: -
--

ALTER TABLE ONLY testing.community_pacing
    ADD CONSTRAINT community_pacing_pkey PRIMARY KEY (id);


--
-- Name: connections connections_pkey; Type: CONSTRAINT; Schema: testing; Owner: -
--

ALTER TABLE ONLY testing.connections
    ADD CONSTRAINT connections_pkey PRIMARY KEY (id);


--
-- Name: connections connections_user_id_connected_user_id_key; Type: CONSTRAINT; Schema: testing; Owner: -
--

ALTER TABLE ONLY testing.connections
    ADD CONSTRAINT connections_user_id_connected_user_id_key UNIQUE (user_id, connected_user_id);


--
-- Name: engagement_logs engagement_logs_pkey; Type: CONSTRAINT; Schema: testing; Owner: -
--

ALTER TABLE ONLY testing.engagement_logs
    ADD CONSTRAINT engagement_logs_pkey PRIMARY KEY (id);


--
-- Name: match_scheduling_messages match_scheduling_messages_pkey; Type: CONSTRAINT; Schema: testing; Owner: -
--

ALTER TABLE ONLY testing.match_scheduling_messages
    ADD CONSTRAINT match_scheduling_messages_pkey PRIMARY KEY (id);


--
-- Name: matches matches_pkey; Type: CONSTRAINT; Schema: testing; Owner: -
--

ALTER TABLE ONLY testing.matches
    ADD CONSTRAINT matches_pkey PRIMARY KEY (id);


--
-- Name: matches matches_user1_id_user2_id_key; Type: CONSTRAINT; Schema: testing; Owner: -
--

ALTER TABLE ONLY testing.matches
    ADD CONSTRAINT matches_user1_id_user2_id_key UNIQUE (user1_id, user2_id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: testing; Owner: -
--

ALTER TABLE ONLY testing.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: process_gaps process_gaps_pkey; Type: CONSTRAINT; Schema: testing; Owner: -
--

ALTER TABLE ONLY testing.process_gaps
    ADD CONSTRAINT process_gaps_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: testing; Owner: -
--

ALTER TABLE ONLY testing.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: resources resources_pkey; Type: CONSTRAINT; Schema: testing; Owner: -
--

ALTER TABLE ONLY testing.resources
    ADD CONSTRAINT resources_pkey PRIMARY KEY (id);


--
-- Name: saved_items saved_items_pkey; Type: CONSTRAINT; Schema: testing; Owner: -
--

ALTER TABLE ONLY testing.saved_items
    ADD CONSTRAINT saved_items_pkey PRIMARY KEY (id);


--
-- Name: sponsorships sponsorships_pkey; Type: CONSTRAINT; Schema: testing; Owner: -
--

ALTER TABLE ONLY testing.sponsorships
    ADD CONSTRAINT sponsorships_pkey PRIMARY KEY (id);


--
-- Name: tools tools_pkey; Type: CONSTRAINT; Schema: testing; Owner: -
--

ALTER TABLE ONLY testing.tools
    ADD CONSTRAINT tools_pkey PRIMARY KEY (id);


--
-- Name: upduo_session_schedules upduo_session_schedules_pkey; Type: CONSTRAINT; Schema: testing; Owner: -
--

ALTER TABLE ONLY testing.upduo_session_schedules
    ADD CONSTRAINT upduo_session_schedules_pkey PRIMARY KEY (id);


--
-- Name: user_pacing_preferences user_pacing_preferences_pkey; Type: CONSTRAINT; Schema: testing; Owner: -
--

ALTER TABLE ONLY testing.user_pacing_preferences
    ADD CONSTRAINT user_pacing_preferences_pkey PRIMARY KEY (id);


--
-- Name: user_pacing_preferences user_pacing_preferences_user_id_community_id_key; Type: CONSTRAINT; Schema: testing; Owner: -
--

ALTER TABLE ONLY testing.user_pacing_preferences
    ADD CONSTRAINT user_pacing_preferences_user_id_community_id_key UNIQUE (user_id, community_id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: testing; Owner: -
--

ALTER TABLE ONLY testing.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_community_id_key; Type: CONSTRAINT; Schema: testing; Owner: -
--

ALTER TABLE ONLY testing.user_roles
    ADD CONSTRAINT user_roles_user_id_community_id_key UNIQUE (user_id, community_id);


--
-- Name: user_session_schedules user_session_schedules_pkey; Type: CONSTRAINT; Schema: testing; Owner: -
--

ALTER TABLE ONLY testing.user_session_schedules
    ADD CONSTRAINT user_session_schedules_pkey PRIMARY KEY (id);


--
-- Name: user_tools user_tools_pkey; Type: CONSTRAINT; Schema: testing; Owner: -
--

ALTER TABLE ONLY testing.user_tools
    ADD CONSTRAINT user_tools_pkey PRIMARY KEY (id);


--
-- Name: user_tools user_tools_user_id_tool_id_key; Type: CONSTRAINT; Schema: testing; Owner: -
--

ALTER TABLE ONLY testing.user_tools
    ADD CONSTRAINT user_tools_user_id_tool_id_key UNIQUE (user_id, tool_id);


--
-- Name: values_acknowledgment values_acknowledgment_pkey; Type: CONSTRAINT; Schema: testing; Owner: -
--

ALTER TABLE ONLY testing.values_acknowledgment
    ADD CONSTRAINT values_acknowledgment_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: admin_alerts_match_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX admin_alerts_match_id_idx ON public.admin_alerts USING btree (match_id);


--
-- Name: admin_alerts_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX admin_alerts_status_idx ON public.admin_alerts USING btree (status);


--
-- Name: hat_detections_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX hat_detections_user_id_idx ON public.hat_detections USING btree (user_id);


--
-- Name: idx_notification_delivery_logs_channel; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_delivery_logs_channel ON public.notification_delivery_logs USING btree (channel);


--
-- Name: idx_notification_delivery_logs_notification_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_delivery_logs_notification_id ON public.notification_delivery_logs USING btree (notification_id);


--
-- Name: idx_notification_delivery_logs_source_table; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_delivery_logs_source_table ON public.notification_delivery_logs USING btree (source_table);


--
-- Name: idx_notifications_deduplication; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_deduplication ON public.notifications USING btree (user_id, deduplication_key) WHERE (deduplication_key IS NOT NULL);


--
-- Name: idx_notifications_user_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_status ON public.notifications USING btree (user_id, read, created_at DESC);


--
-- Name: idx_pending_announcements_scheduled; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pending_announcements_scheduled ON public.pending_match_announcements USING btree (scheduled_for);


--
-- Name: idx_pending_announcements_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pending_announcements_status ON public.pending_match_announcements USING btree (status);


--
-- Name: idx_pending_notifications_status_channel; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pending_notifications_status_channel ON public.pending_notifications USING btree (status, channel);


--
-- Name: idx_pending_notifications_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pending_notifications_user_id ON public.pending_notifications USING btree (user_id);


--
-- Name: idx_posts_match_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_posts_match_id ON public.posts USING btree (match_id);


--
-- Name: idx_upduo_transcripts_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_upduo_transcripts_created_at ON public.upduo_transcripts USING btree (created_at);


--
-- Name: idx_upduo_transcripts_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_upduo_transcripts_user_id ON public.upduo_transcripts USING btree (user_id);


--
-- Name: idx_upduo_user_associations_sideby_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_upduo_user_associations_sideby_user_id ON public.upduo_user_associations USING btree (sideby_user_id);


--
-- Name: idx_upduo_user_associations_upduo_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_upduo_user_associations_upduo_user_id ON public.upduo_user_associations USING btree (upduo_user_id);


--
-- Name: idx_upduo_user_mappings_sideby_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_upduo_user_mappings_sideby_user_id ON public.upduo_user_mappings USING btree (sideby_user_id);


--
-- Name: idx_upduo_user_mappings_upduo_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_upduo_user_mappings_upduo_user_id ON public.upduo_user_mappings USING btree (upduo_user_id);


--
-- Name: notifications_read_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_read_idx ON public.notifications USING btree (read);


--
-- Name: notifications_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_user_id_idx ON public.notifications USING btree (user_id);


--
-- Name: profile_experiments_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX profile_experiments_type_idx ON public.profile_experiments USING btree (experiment_type);


--
-- Name: profiles_email_unique_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX profiles_email_unique_idx ON public.profiles USING btree (email);


--
-- Name: unique_active_match; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_active_match ON public.matches USING btree (LEAST(user1_id, user2_id), GREATEST(user1_id, user2_id)) WHERE (status = 'active'::text);


--
-- Name: INDEX unique_active_match; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.unique_active_match IS 'Ensures users can only have one active match between them at a time';


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: -
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: supabase_functions_hooks_h_table_id_h_name_idx; Type: INDEX; Schema: supabase_functions; Owner: -
--

CREATE INDEX supabase_functions_hooks_h_table_id_h_name_idx ON supabase_functions.hooks USING btree (hook_table_id, hook_name);


--
-- Name: supabase_functions_hooks_request_id_idx; Type: INDEX; Schema: supabase_functions; Owner: -
--

CREATE INDEX supabase_functions_hooks_request_id_idx ON supabase_functions.hooks USING btree (request_id);


--
-- Name: messages_2025_04_24_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_04_24_pkey;


--
-- Name: messages_2025_04_25_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_04_25_pkey;


--
-- Name: messages_2025_04_26_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_04_26_pkey;


--
-- Name: messages_2025_04_27_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_04_27_pkey;


--
-- Name: messages_2025_04_28_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_04_28_pkey;


--
-- Name: messages_2025_04_29_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_04_29_pkey;


--
-- Name: messages_2025_04_30_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_04_30_pkey;


--
-- Name: messages_2025_05_01_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_05_01_pkey;


--
-- Name: messages_2025_05_02_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_05_02_pkey;


--
-- Name: messages_2025_05_03_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_05_03_pkey;


--
-- Name: messages_2025_05_04_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_05_04_pkey;


--
-- Name: users on_auth_user_created; Type: TRIGGER; Schema: auth; Owner: -
--

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


--
-- Name: users on_auth_user_created_check_admin; Type: TRIGGER; Schema: auth; Owner: -
--

CREATE TRIGGER on_auth_user_created_check_admin AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_admin_user();


--
-- Name: users on_auth_user_email_updated; Type: TRIGGER; Schema: auth; Owner: -
--

CREATE TRIGGER on_auth_user_email_updated AFTER UPDATE OF email ON auth.users FOR EACH ROW EXECUTE FUNCTION public.sync_user_email();


--
-- Name: profiles auto_enroll_beta_users_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER auto_enroll_beta_users_trigger AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.auto_enroll_beta_users();


--
-- Name: matches enforce_match_limit_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER enforce_match_limit_trigger BEFORE INSERT ON public.matches FOR EACH ROW EXECUTE FUNCTION public.enforce_match_limit();


--
-- Name: match_scheduling_messages handle_admin_message_before_insert; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_admin_message_before_insert BEFORE INSERT ON public.match_scheduling_messages FOR EACH ROW EXECUTE FUNCTION public.handle_admin_message();


--
-- Name: matches handle_match_email; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_match_email AFTER INSERT ON public.matches FOR EACH ROW EXECUTE FUNCTION public.handle_match_email();


--
-- Name: match_scheduling_messages on_new_message_notification; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_new_message_notification AFTER INSERT ON public.match_scheduling_messages FOR EACH ROW EXECUTE FUNCTION public.handle_notification_request();


--
-- Name: profiles profile_deletion_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER profile_deletion_trigger AFTER UPDATE OF status ON public.profiles FOR EACH ROW WHEN ((new.status = 'deleted'::text)) EXECUTE FUNCTION public.handle_profile_deletion();


--
-- Name: hat_detections set_hat_detections_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_hat_detections_updated_at BEFORE UPDATE ON public.hat_detections FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: engagement_stats set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.engagement_stats FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: match_admin_messages set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.match_admin_messages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: match_conversation_analysis set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.match_conversation_analysis FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: match_meeting_times set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.match_meeting_times FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: match_scheduling_messages set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.match_scheduling_messages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: profile_experiments set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.profile_experiments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: saved_items set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.saved_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: tools set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.tools FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: upduo_transcripts set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.upduo_transcripts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: user_availability set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.user_availability FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: user_session_schedules set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.user_session_schedules FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: user_tools set_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.user_tools FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: admin_alerts set_timestamp_admin_alerts; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp_admin_alerts BEFORE UPDATE ON public.admin_alerts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: post_visibility set_timestamp_post_visibility; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp_post_visibility BEFORE UPDATE ON public.post_visibility FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_trigger_for_visibility();


--
-- Name: upduo_user_associations set_timestamp_upduo_user_associations; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp_upduo_user_associations BEFORE UPDATE ON public.upduo_user_associations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: comments set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: community_pacing set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.community_pacing FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: process_gaps set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.process_gaps FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: saved_items set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.saved_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: sponsorships set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.sponsorships FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: user_custom_tools set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.user_custom_tools FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: user_pacing_preferences set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.user_pacing_preferences FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: notifications set_updated_at_for_notifications; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at_for_notifications BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_for_notifications();


--
-- Name: hat_inference_requests set_updated_at_hat_inference_requests; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at_hat_inference_requests BEFORE UPDATE ON public.hat_inference_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_for_hat_metadata();


--
-- Name: hat_metadata set_updated_at_hat_metadata; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at_hat_metadata BEFORE UPDATE ON public.hat_metadata FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_for_hat_metadata();


--
-- Name: notification_delivery_logs set_updated_at_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at_trigger BEFORE UPDATE ON public.notification_delivery_logs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_for_logs();


--
-- Name: upduo_user_mappings set_updated_at_trigger_for_upduo_mappings; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at_trigger_for_upduo_mappings BEFORE UPDATE ON public.upduo_user_mappings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_for_upduo_mappings();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: -
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: admin_alerts admin_alerts_match_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_alerts
    ADD CONSTRAINT admin_alerts_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id) ON DELETE CASCADE;


--
-- Name: admin_users admin_users_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: beta_users beta_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beta_users
    ADD CONSTRAINT beta_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: comments comments_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: comments comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);


--
-- Name: community_feature_flags community_feature_flags_community_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_feature_flags
    ADD CONSTRAINT community_feature_flags_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(id) ON DELETE CASCADE;


--
-- Name: community_members community_members_community_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_members
    ADD CONSTRAINT community_members_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(id);


--
-- Name: community_members community_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_members
    ADD CONSTRAINT community_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);


--
-- Name: community_pacing community_pacing_community_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_pacing
    ADD CONSTRAINT community_pacing_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(id) ON DELETE CASCADE;


--
-- Name: engagement_logs engagement_logs_community_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.engagement_logs
    ADD CONSTRAINT engagement_logs_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(id);


--
-- Name: engagement_logs engagement_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.engagement_logs
    ADD CONSTRAINT engagement_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);


--
-- Name: engagement_stats engagement_stats_community_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.engagement_stats
    ADD CONSTRAINT engagement_stats_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(id) ON DELETE CASCADE;


--
-- Name: engagement_stats engagement_stats_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.engagement_stats
    ADD CONSTRAINT engagement_stats_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: posts fk_posts_match_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT fk_posts_match_id FOREIGN KEY (match_id) REFERENCES public.matches(id) ON DELETE SET NULL;


--
-- Name: hat_detections hat_detections_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hat_detections
    ADD CONSTRAINT hat_detections_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);


--
-- Name: hat_inference_requests hat_inference_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hat_inference_requests
    ADD CONSTRAINT hat_inference_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: hat_metadata hat_metadata_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hat_metadata
    ADD CONSTRAINT hat_metadata_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: match_admin_messages match_admin_messages_match_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_admin_messages
    ADD CONSTRAINT match_admin_messages_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id) ON DELETE CASCADE;


--
-- Name: match_conversation_analysis match_conversation_analysis_match_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_conversation_analysis
    ADD CONSTRAINT match_conversation_analysis_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id);


--
-- Name: match_meeting_times match_meeting_times_match_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_meeting_times
    ADD CONSTRAINT match_meeting_times_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id);


--
-- Name: match_scheduling_messages match_scheduling_messages_match_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_scheduling_messages
    ADD CONSTRAINT match_scheduling_messages_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id) ON DELETE CASCADE;


--
-- Name: match_scheduling_messages match_scheduling_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_scheduling_messages
    ADD CONSTRAINT match_scheduling_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id);


--
-- Name: matches matches_completed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_completed_by_fkey FOREIGN KEY (completed_by) REFERENCES auth.users(id);


--
-- Name: matches matches_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- Name: matches matches_user1_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_user1_id_fkey FOREIGN KEY (user1_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: matches matches_user2_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_user2_id_fkey FOREIGN KEY (user2_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: notification_delivery_logs notification_delivery_logs_notification_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_delivery_logs
    ADD CONSTRAINT notification_delivery_logs_notification_id_fkey FOREIGN KEY (notification_id) REFERENCES public.notifications(id);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: pending_match_announcements pending_match_announcements_match_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pending_match_announcements
    ADD CONSTRAINT pending_match_announcements_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id) ON DELETE CASCADE;


--
-- Name: pending_notifications pending_notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pending_notifications
    ADD CONSTRAINT pending_notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: post_visibility post_visibility_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_visibility
    ADD CONSTRAINT post_visibility_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: post_visibility post_visibility_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_visibility
    ADD CONSTRAINT post_visibility_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: posts posts_experiment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_experiment_id_fkey FOREIGN KEY (experiment_id) REFERENCES public.profile_experiments(id);


--
-- Name: posts posts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);


--
-- Name: process_gaps process_gaps_closed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.process_gaps
    ADD CONSTRAINT process_gaps_closed_by_fkey FOREIGN KEY (closed_by) REFERENCES public.profiles(id);


--
-- Name: process_gaps process_gaps_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.process_gaps
    ADD CONSTRAINT process_gaps_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- Name: profile_experiments profile_experiments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_experiments
    ADD CONSTRAINT profile_experiments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- Name: profile_experiments profile_experiments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_experiments
    ADD CONSTRAINT profile_experiments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_impersonating_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_impersonating_user_id_fkey FOREIGN KEY (impersonating_user_id) REFERENCES public.profiles(id);


--
-- Name: saved_items saved_items_original_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_items
    ADD CONSTRAINT saved_items_original_post_id_fkey FOREIGN KEY (original_post_id) REFERENCES public.posts(id);


--
-- Name: saved_items saved_items_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_items
    ADD CONSTRAINT saved_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);


--
-- Name: sponsorships sponsorships_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sponsorships
    ADD CONSTRAINT sponsorships_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);


--
-- Name: upduo_transcripts upduo_transcripts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.upduo_transcripts
    ADD CONSTRAINT upduo_transcripts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: upduo_user_associations upduo_user_associations_sideby_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.upduo_user_associations
    ADD CONSTRAINT upduo_user_associations_sideby_user_id_fkey FOREIGN KEY (sideby_user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: user_availability user_availability_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_availability
    ADD CONSTRAINT user_availability_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_custom_tools user_custom_tools_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_custom_tools
    ADD CONSTRAINT user_custom_tools_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: user_flow_activities user_flow_activities_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_flow_activities
    ADD CONSTRAINT user_flow_activities_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);


--
-- Name: user_pacing_preferences user_pacing_preferences_community_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_pacing_preferences
    ADD CONSTRAINT user_pacing_preferences_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(id);


--
-- Name: user_pacing_preferences user_pacing_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_pacing_preferences
    ADD CONSTRAINT user_pacing_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);


--
-- Name: user_roles user_roles_community_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_session_schedules user_session_schedules_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_session_schedules
    ADD CONSTRAINT user_session_schedules_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);


--
-- Name: user_tools user_tools_assigned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_tools
    ADD CONSTRAINT user_tools_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES auth.users(id);


--
-- Name: user_tools user_tools_tool_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_tools
    ADD CONSTRAINT user_tools_tool_id_fkey FOREIGN KEY (tool_id) REFERENCES public.tools(id) ON DELETE CASCADE;


--
-- Name: user_tools user_tools_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_tools
    ADD CONSTRAINT user_tools_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: values_acknowledgment values_acknowledgment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.values_acknowledgment
    ADD CONSTRAINT values_acknowledgment_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: users Allow admins to view users; Type: POLICY; Schema: auth; Owner: -
--

CREATE POLICY "Allow admins to view users" ON auth.users FOR SELECT TO authenticated USING ((split_part((auth.jwt() ->> 'email'::text), '@'::text, 2) = 'sideby.ai'::text));


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: hat_embeddings Admin users can insert hat embeddings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin users can insert hat embeddings" ON public.hat_embeddings FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.email ~~ '%@sideby.ai'::text)))));


--
-- Name: hat_similarity_cache Admin users can insert hat similarities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin users can insert hat similarities" ON public.hat_similarity_cache FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.email ~~ '%@sideby.ai'::text)))));


--
-- Name: profile_experiments Admin users can manage all experiments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin users can manage all experiments" ON public.profile_experiments TO authenticated USING (public.is_sideby_admin_from_profile(auth.uid()));


--
-- Name: pending_match_announcements Admin users can manage match announcements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin users can manage match announcements" ON public.pending_match_announcements USING (public.is_sideby_admin_from_profile(auth.uid()));


--
-- Name: hat_embeddings Admin users can update hat embeddings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin users can update hat embeddings" ON public.hat_embeddings FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.email ~~ '%@sideby.ai'::text)))));


--
-- Name: hat_similarity_cache Admin users can update hat similarities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin users can update hat similarities" ON public.hat_similarity_cache FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.email ~~ '%@sideby.ai'::text)))));


--
-- Name: hat_embeddings Admin users can view hat embeddings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin users can view hat embeddings" ON public.hat_embeddings FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.email ~~ '%@sideby.ai'::text)))));


--
-- Name: hat_similarity_cache Admin users can view hat similarities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin users can view hat similarities" ON public.hat_similarity_cache FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.email ~~ '%@sideby.ai'::text)))));


--
-- Name: matches Admins can create matches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can create matches" ON public.matches FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.admin_users
  WHERE (admin_users.id = auth.uid()))));


--
-- Name: matches Admins can delete matches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete matches" ON public.matches FOR DELETE TO authenticated USING (public.is_sideby_admin(auth.uid()));


--
-- Name: admin_alerts Admins can do anything with alerts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can do anything with alerts" ON public.admin_alerts TO authenticated USING ((auth.email() ~~ '%@sideby.ai'::text)) WITH CHECK ((auth.email() ~~ '%@sideby.ai'::text));


--
-- Name: matches Admins can insert matches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert matches" ON public.matches FOR INSERT TO authenticated WITH CHECK (public.is_sideby_admin(auth.uid()));


--
-- Name: match_admin_messages Admins can insert messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert messages" ON public.match_admin_messages FOR INSERT TO authenticated WITH CHECK (public.is_sideby_admin(auth.uid()));


--
-- Name: notification_delivery_logs Admins can insert notification logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert notification logs" ON public.notification_delivery_logs FOR INSERT WITH CHECK (public.is_sideby_admin(auth.uid()));


--
-- Name: user_pacing_preferences Admins can insert pacing preferences for any user; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert pacing preferences for any user" ON public.user_pacing_preferences FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.email ~~ '%@sideby.ai'::text)))));


--
-- Name: process_gaps Admins can insert process gaps; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert process gaps" ON public.process_gaps FOR INSERT TO authenticated WITH CHECK (((auth.jwt() ->> 'email'::text) ~~ '%@sideby.ai'::text));


--
-- Name: upduo_user_associations Admins can manage all upduo user associations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all upduo user associations" ON public.upduo_user_associations USING (public.is_sideby_admin_from_profile(auth.uid())) WITH CHECK (public.is_sideby_admin_from_profile(auth.uid()));


--
-- Name: community_feature_flags Admins can manage community feature flags; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage community feature flags" ON public.community_feature_flags TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.admin_users
  WHERE (admin_users.id = auth.uid()))));


--
-- Name: global_feature_flags Admins can manage global feature flags; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage global feature flags" ON public.global_feature_flags TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.email ~~ '%@sideby.ai'::text)))));


--
-- Name: post_visibility Admins can manage post visibility; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage post visibility" ON public.post_visibility TO authenticated USING (public.is_sideby_admin_from_profile(auth.uid()));


--
-- Name: user_tools Admins can manage tool assignments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage tool assignments" ON public.user_tools TO authenticated USING (((auth.jwt() ->> 'email'::text) ~~ '%@sideby.ai'::text)) WITH CHECK (((auth.jwt() ->> 'email'::text) ~~ '%@sideby.ai'::text));


--
-- Name: tools Admins can manage tools; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage tools" ON public.tools TO authenticated USING (((auth.jwt() ->> 'email'::text) ~~ '%@sideby.ai'::text)) WITH CHECK (((auth.jwt() ->> 'email'::text) ~~ '%@sideby.ai'::text));


--
-- Name: match_admin_messages Admins can read all messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can read all messages" ON public.match_admin_messages FOR SELECT TO authenticated USING (public.is_sideby_admin(auth.uid()));


--
-- Name: user_pacing_preferences Admins can read all pacing preferences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can read all pacing preferences" ON public.user_pacing_preferences FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.email ~~ '%@sideby.ai'::text)))));


--
-- Name: matches Admins can select all matches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can select all matches" ON public.matches FOR SELECT TO authenticated USING (public.is_sideby_admin(auth.uid()));


--
-- Name: profiles Admins can update impersonating_user_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update impersonating_user_id" ON public.profiles FOR UPDATE USING ((auth.email() ~~ '%@sideby.ai'::text)) WITH CHECK ((auth.email() ~~ '%@sideby.ai'::text));


--
-- Name: matches Admins can update match completion; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update match completion" ON public.matches FOR UPDATE TO authenticated USING (public.can_complete_matches(auth.uid())) WITH CHECK (public.can_complete_matches(auth.uid()));


--
-- Name: matches Admins can update matches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update matches" ON public.matches FOR UPDATE TO authenticated USING ((auth.uid() IN ( SELECT users.id
   FROM auth.users
  WHERE ((users.email)::text ~~ '%@sideby.ai'::text)))) WITH CHECK ((auth.uid() IN ( SELECT users.id
   FROM auth.users
  WHERE ((users.email)::text ~~ '%@sideby.ai'::text))));


--
-- Name: process_gaps Admins can update process gaps; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update process gaps" ON public.process_gaps FOR UPDATE TO authenticated USING (((auth.jwt() ->> 'email'::text) ~~ '%@sideby.ai'::text));


--
-- Name: match_admin_messages Admins can update their admin messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update their admin messages" ON public.match_admin_messages FOR UPDATE USING (((EXISTS ( SELECT 1
   FROM auth.users
  WHERE ((users.id = auth.uid()) AND ((users.email)::text ~~ '%@sideby.ai'::text)))) AND (auth.uid() = sender_id)));


--
-- Name: admin_users Admins can view all admin users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all admin users" ON public.admin_users FOR SELECT TO authenticated USING (((auth.jwt() ->> 'email'::text) ~~ '%@sideby.ai'::text));


--
-- Name: matches Admins can view all matches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all matches" ON public.matches TO authenticated USING (public.is_sideby_admin(auth.uid()));


--
-- Name: notification_delivery_logs Admins can view all notification logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all notification logs" ON public.notification_delivery_logs FOR SELECT USING (public.is_sideby_admin(auth.uid()));


--
-- Name: process_gaps Admins can view all process gaps; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all process gaps" ON public.process_gaps FOR SELECT TO authenticated USING (((auth.jwt() ->> 'email'::text) ~~ '%@sideby.ai'::text));


--
-- Name: profiles Admins can view all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all profiles" ON public.profiles TO authenticated USING (public.is_sideby_admin(auth.uid()));


--
-- Name: saved_items Admins can view all saved items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all saved items" ON public.saved_items FOR SELECT USING (((auth.uid() IN ( SELECT profiles.id
   FROM public.profiles
  WHERE (profiles.email ~~ '%@sideby.ai'::text))) OR (auth.uid() = user_id)));


--
-- Name: user_availability Admins can view all user availability; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all user availability" ON public.user_availability FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.email ~~ '%@sideby.ai'::text)))));


--
-- Name: user_flow_activities Admins have full access to flow activities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins have full access to flow activities" ON public.user_flow_activities USING (((auth.jwt() ->> 'email'::text) ~~ '%@sideby.ai'::text));


--
-- Name: profile_experiments Allow admin users full access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow admin users full access" ON public.profile_experiments USING (((auth.jwt() ->> 'email'::text) ~~ '%@sideby.ai'::text)) WITH CHECK (((auth.jwt() ->> 'email'::text) ~~ '%@sideby.ai'::text));


--
-- Name: matches Allow admins to insert matches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow admins to insert matches" ON public.matches FOR INSERT TO authenticated WITH CHECK (((auth.jwt() ->> 'email'::text) ~~ '%@sideby.ai'::text));


--
-- Name: pending_notifications Allow admins to manage notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow admins to manage notifications" ON public.pending_notifications USING (public.is_sideby_admin(auth.uid()));


--
-- Name: matches Allow admins to read matches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow admins to read matches" ON public.matches FOR SELECT TO authenticated USING (((auth.jwt() ->> 'email'::text) ~~ '%@sideby.ai'::text));


--
-- Name: matches Allow admins to update matches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow admins to update matches" ON public.matches FOR UPDATE TO authenticated USING (((auth.jwt() ->> 'email'::text) ~~ '%@sideby.ai'::text)) WITH CHECK (((auth.jwt() ->> 'email'::text) ~~ '%@sideby.ai'::text));


--
-- Name: matches Allow admins to view all matches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow admins to view all matches" ON public.matches FOR SELECT TO authenticated USING (((auth.jwt() ->> 'email'::text) ~~ '%@sideby.ai'::text));


--
-- Name: profiles Allow admins to view all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow admins to view all profiles" ON public.profiles FOR SELECT TO authenticated USING (((auth.jwt() ->> 'email'::text) ~~ '%@sideby.ai'::text));


--
-- Name: match_scheduling_messages Allow admins to view all scheduling messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow admins to view all scheduling messages" ON public.match_scheduling_messages TO authenticated USING (((auth.jwt() ->> 'email'::text) ~~ '%@sideby.ai'::text));


--
-- Name: matches Allow admins to view matches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow admins to view matches" ON public.matches FOR SELECT TO authenticated USING (((auth.jwt() ->> 'email'::text) ~~ '%@sideby.ai'::text));


--
-- Name: profiles Allow all users to view profiles for matches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all users to view profiles for matches" ON public.profiles FOR SELECT TO authenticated USING (true);


--
-- Name: upduo_user_mappings Allow insert for authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow insert for authenticated users" ON public.upduo_user_mappings FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: profiles Allow only sideby.ai users to remove users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow only sideby.ai users to remove users" ON public.profiles FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles profiles_1
  WHERE ((profiles_1.id = auth.uid()) AND (profiles_1.email ~~ '%@sideby.ai'::text)))));


--
-- Name: matches Allow reading matches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow reading matches" ON public.matches FOR SELECT TO authenticated USING (((auth.uid() = user1_id) OR (auth.uid() = user2_id) OR public.can_complete_matches(auth.uid())));


--
-- Name: upduo_user_mappings Allow select for authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow select for authenticated users" ON public.upduo_user_mappings FOR SELECT TO authenticated USING (true);


--
-- Name: match_scheduling_messages Allow sideby admins full access to messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow sideby admins full access to messages" ON public.match_scheduling_messages TO authenticated USING (public.is_sideby_admin(auth.uid()));


--
-- Name: matches Allow sideby.ai users to complete matches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow sideby.ai users to complete matches" ON public.matches FOR UPDATE TO authenticated USING (public.can_complete_matches(auth.uid())) WITH CHECK (public.can_complete_matches(auth.uid()));


--
-- Name: posts Allow users to delete their own posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow users to delete their own posts" ON public.posts FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: match_scheduling_messages Allow users to insert messages for their matches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow users to insert messages for their matches" ON public.match_scheduling_messages FOR INSERT TO authenticated WITH CHECK ((auth.uid() IN ( SELECT matches.user1_id
   FROM public.matches
  WHERE (matches.id = match_scheduling_messages.match_id)
UNION
 SELECT matches.user2_id
   FROM public.matches
  WHERE (matches.id = match_scheduling_messages.match_id))));


--
-- Name: posts Allow users to insert their own posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow users to insert their own posts" ON public.posts FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: match_scheduling_messages Allow users to read their own match messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow users to read their own match messages" ON public.match_scheduling_messages FOR SELECT TO authenticated USING ((auth.uid() IN ( SELECT matches.user1_id
   FROM public.matches
  WHERE (matches.id = match_scheduling_messages.match_id)
UNION
 SELECT matches.user2_id
   FROM public.matches
  WHERE (matches.id = match_scheduling_messages.match_id))));


--
-- Name: posts Allow users to see all posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow users to see all posts" ON public.posts FOR SELECT TO authenticated USING (true);


--
-- Name: posts Allow users to update their own posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow users to update their own posts" ON public.posts FOR UPDATE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: notifications Anyone can insert notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);


--
-- Name: communities Anyone can read communities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can read communities" ON public.communities FOR SELECT TO authenticated USING (true);


--
-- Name: profiles Anyone can read profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can read profiles" ON public.profiles FOR SELECT TO authenticated USING (true);


--
-- Name: post_visibility Anyone can view post visibility; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view post visibility" ON public.post_visibility FOR SELECT TO authenticated USING (true);


--
-- Name: comments Comments are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Comments are viewable by everyone" ON public.comments FOR SELECT TO authenticated USING (true);


--
-- Name: communities Communities are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Communities are viewable by everyone" ON public.communities FOR SELECT USING (true);


--
-- Name: user_roles Community managers can insert roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Community managers can insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_community_role(auth.uid(), community_id, 'community_manager'::public.app_role));


--
-- Name: user_roles Community managers can update roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Community managers can update roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.has_community_role(auth.uid(), community_id, 'community_manager'::public.app_role));


--
-- Name: community_feature_flags Community members can read their community's feature flags; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Community members can read their community's feature flags" ON public.community_feature_flags FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.community_members
  WHERE ((community_members.user_id = auth.uid()) AND (community_members.community_id = community_feature_flags.community_id) AND (community_members.status = 'active'::text)))));


--
-- Name: community_pacing Community pacing settings are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Community pacing settings are viewable by everyone" ON public.community_pacing FOR SELECT TO authenticated USING (true);


--
-- Name: global_feature_flags Everyone can read global feature flags; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can read global feature flags" ON public.global_feature_flags FOR SELECT TO authenticated USING ((active = true));


--
-- Name: beta_users Only admins can modify beta status; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can modify beta status" ON public.beta_users USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.email ~~ '%@sideby.ai'::text)))));


--
-- Name: posts Posts are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Posts are viewable by everyone" ON public.posts FOR SELECT TO authenticated USING (true);


--
-- Name: profiles Public profiles are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT TO authenticated USING (true);


--
-- Name: notification_delivery_logs Service role can insert notification logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can insert notification logs" ON public.notification_delivery_logs FOR INSERT WITH CHECK ((auth.role() = 'service_role'::text));


--
-- Name: notifications Service role can manage all notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage all notifications" ON public.notifications USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text));


--
-- Name: notification_delivery_logs Service role can update notification logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can update notification logs" ON public.notification_delivery_logs FOR UPDATE USING ((auth.role() = 'service_role'::text));


--
-- Name: match_conversation_analysis Sideby admins can insert match analysis; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Sideby admins can insert match analysis" ON public.match_conversation_analysis FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM auth.users
  WHERE ((users.id = auth.uid()) AND ((users.email)::text ~~ '%@sideby.ai'::text)))));


--
-- Name: match_conversation_analysis Sideby admins can read match analysis; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Sideby admins can read match analysis" ON public.match_conversation_analysis FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM auth.users
  WHERE ((users.id = auth.uid()) AND ((users.email)::text ~~ '%@sideby.ai'::text)))));


--
-- Name: engagement_stats System can insert engagement stats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert engagement stats" ON public.engagement_stats FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: hat_detections System can insert hat detections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert hat detections" ON public.hat_detections FOR INSERT WITH CHECK (true);


--
-- Name: tools Tools are viewable by authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tools are viewable by authenticated users" ON public.tools FOR SELECT TO authenticated USING (true);


--
-- Name: upduo_session_schedules Upduo schedules are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Upduo schedules are viewable by everyone" ON public.upduo_session_schedules FOR SELECT USING (true);


--
-- Name: admin_alerts Users can create alerts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create alerts" ON public.admin_alerts FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: comments Users can create comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create comments" ON public.comments FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: engagement_logs Users can create engagement logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create engagement logs" ON public.engagement_logs FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: posts Users can create posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create posts" ON public.posts FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: sponsorships Users can create sponsorship claims; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create sponsorship claims" ON public.sponsorships FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_custom_tools Users can create their own custom tools; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own custom tools" ON public.user_custom_tools FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_pacing_preferences Users can create their own pacing preferences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own pacing preferences" ON public.user_pacing_preferences FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_session_schedules Users can create their own schedules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own schedules" ON public.user_session_schedules FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: comments Users can delete own comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: user_pacing_preferences Users can delete own pacing preferences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own pacing preferences" ON public.user_pacing_preferences FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: user_custom_tools Users can delete their own custom tools; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own custom tools" ON public.user_custom_tools FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: saved_items Users can delete their own saved items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own saved items" ON public.saved_items FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: match_scheduling_messages Users can insert messages for their matches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert messages for their matches" ON public.match_scheduling_messages FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.matches
  WHERE ((matches.id = match_scheduling_messages.match_id) AND ((matches.user1_id = auth.uid()) OR (matches.user2_id = auth.uid()))))));


--
-- Name: user_pacing_preferences Users can insert own pacing preferences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own pacing preferences" ON public.user_pacing_preferences FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: posts Users can insert own posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own posts" ON public.posts FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));


--
-- Name: user_availability Users can insert their own availability; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own availability" ON public.user_availability FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK ((auth.uid() = id));


--
-- Name: saved_items Users can insert their own saved items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own saved items" ON public.saved_items FOR INSERT TO authenticated WITH CHECK (((auth.uid() = user_id) OR (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.email ~~ '%@sideby.ai'::text))))));


--
-- Name: upduo_transcripts Users can insert their own transcripts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own transcripts" ON public.upduo_transcripts FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: community_members Users can join communities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can join communities" ON public.community_members FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: community_members Users can leave communities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can leave communities" ON public.community_members FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: upduo_transcripts Users can manage their own transcripts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own transcripts" ON public.upduo_transcripts TO authenticated USING ((auth.uid() = user_id));


--
-- Name: values_acknowledgment Users can only view and insert their own acknowledgment; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can only view and insert their own acknowledgment" ON public.values_acknowledgment USING ((auth.uid() = id)) WITH CHECK ((auth.uid() = id));


--
-- Name: match_scheduling_messages Users can read messages for their matches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read messages for their matches" ON public.match_scheduling_messages FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.matches
  WHERE ((matches.id = match_scheduling_messages.match_id) AND ((matches.user1_id = auth.uid()) OR (matches.user2_id = auth.uid()))))));


--
-- Name: user_pacing_preferences Users can read own pacing preferences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read own pacing preferences" ON public.user_pacing_preferences FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: beta_users Users can read their own beta status; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read their own beta status" ON public.beta_users FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: upduo_transcripts Users can read their own transcripts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read their own transcripts" ON public.upduo_transcripts FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- Name: saved_items Users can save items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can save items" ON public.saved_items FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: saved_items Users can save microtranslations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can save microtranslations" ON public.saved_items FOR INSERT TO authenticated WITH CHECK ((type = 'microtranslation'::public.saved_item_type));


--
-- Name: match_scheduling_messages Users can send match messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can send match messages" ON public.match_scheduling_messages FOR INSERT WITH CHECK (((auth.uid() = sender_id) AND (auth.uid() IN ( SELECT matches.user1_id
   FROM public.matches
  WHERE (matches.id = match_scheduling_messages.match_id)
UNION
 SELECT matches.user2_id
   FROM public.matches
  WHERE (matches.id = match_scheduling_messages.match_id)))));


--
-- Name: match_scheduling_messages Users can send messages to their matches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can send messages to their matches" ON public.match_scheduling_messages FOR INSERT TO authenticated WITH CHECK (((EXISTS ( SELECT 1
   FROM public.matches
  WHERE ((matches.id = match_scheduling_messages.match_id) AND ((matches.user1_id = auth.uid()) OR (matches.user2_id = auth.uid())) AND (matches.status = 'active'::text)))) AND (sender_id = auth.uid())));


--
-- Name: comments Users can update own comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own comments" ON public.comments FOR UPDATE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: user_pacing_preferences Users can update own pacing preferences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own pacing preferences" ON public.user_pacing_preferences FOR UPDATE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: posts Users can update own posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own posts" ON public.posts FOR UPDATE TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING ((auth.uid() = id)) WITH CHECK ((auth.uid() = id));


--
-- Name: user_availability Users can update their own availability; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own availability" ON public.user_availability FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_custom_tools Users can update their own custom tools; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own custom tools" ON public.user_custom_tools FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: engagement_stats Users can update their own engagement stats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own engagement stats" ON public.engagement_stats FOR UPDATE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: hat_detections Users can update their own hat detections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own hat detections" ON public.hat_detections FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: notifications Users can update their own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_pacing_preferences Users can update their own pacing preferences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own pacing preferences" ON public.user_pacing_preferences FOR UPDATE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: saved_items Users can update their own saved items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own saved items" ON public.saved_items FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_session_schedules Users can update their own schedules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own schedules" ON public.user_session_schedules FOR UPDATE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: match_scheduling_messages Users can update their own scheduling messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own scheduling messages" ON public.match_scheduling_messages FOR UPDATE USING ((auth.uid() = sender_id));


--
-- Name: profiles Users can update their own subject statuses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own subject statuses" ON public.profiles FOR UPDATE USING ((auth.uid() = id)) WITH CHECK ((auth.uid() = id));


--
-- Name: match_scheduling_messages Users can view messages from their matches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view messages from their matches" ON public.match_scheduling_messages FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.matches
  WHERE ((matches.id = match_scheduling_messages.match_id) AND ((matches.user1_id = auth.uid()) OR (matches.user2_id = auth.uid()))))));


--
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING ((auth.uid() = id));


--
-- Name: posts Users can view posts based on visibility settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view posts based on visibility settings" ON public.posts FOR SELECT TO authenticated USING (((status = 'active'::text) OR public.is_sideby_admin_from_profile(auth.uid())));


--
-- Name: posts Users can view posts from community members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view posts from community members" ON public.posts FOR SELECT TO authenticated USING (((EXISTS ( SELECT 1
   FROM (public.community_members cm1
     JOIN public.community_members cm2 ON ((cm1.community_id = cm2.community_id)))
  WHERE ((cm1.user_id = auth.uid()) AND (cm2.user_id = posts.user_id)))) OR (user_id = auth.uid())));


--
-- Name: profiles Users can view profiles of their matches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view profiles of their matches" ON public.profiles FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.matches
  WHERE (((matches.user1_id = auth.uid()) AND (matches.user2_id = profiles.id)) OR ((matches.user2_id = auth.uid()) AND (matches.user1_id = profiles.id))))));


--
-- Name: user_roles Users can view roles in their communities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view roles in their communities" ON public.user_roles FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.community_members cm
  WHERE ((cm.community_id = user_roles.community_id) AND (cm.user_id = auth.uid())))));


--
-- Name: user_tools Users can view their assigned tools; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their assigned tools" ON public.user_tools FOR SELECT TO authenticated USING (((auth.uid() = user_id) OR ((auth.jwt() ->> 'email'::text) ~~ '%@sideby.ai'::text)));


--
-- Name: match_scheduling_messages Users can view their match messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their match messages" ON public.match_scheduling_messages FOR SELECT USING ((auth.uid() IN ( SELECT matches.user1_id
   FROM public.matches
  WHERE (matches.id = match_scheduling_messages.match_id)
UNION
 SELECT matches.user2_id
   FROM public.matches
  WHERE (matches.id = match_scheduling_messages.match_id))));


--
-- Name: user_availability Users can view their own availability; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own availability" ON public.user_availability FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_custom_tools Users can view their own custom tools; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own custom tools" ON public.user_custom_tools FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: engagement_logs Users can view their own engagement logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own engagement logs" ON public.engagement_logs FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: engagement_stats Users can view their own engagement stats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own engagement stats" ON public.engagement_stats FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: profile_experiments Users can view their own experiments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own experiments" ON public.profile_experiments FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- Name: user_flow_activities Users can view their own flow activities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own flow activities" ON public.user_flow_activities FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: hat_detections Users can view their own hat detections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own hat detections" ON public.hat_detections FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: matches Users can view their own matches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own matches" ON public.matches FOR SELECT TO authenticated USING (((auth.uid() = user1_id) OR (auth.uid() = user2_id) OR (auth.uid() = created_by)));


--
-- Name: match_meeting_times Users can view their own meeting times; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own meeting times" ON public.match_meeting_times FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.matches m
  WHERE ((m.id = match_meeting_times.match_id) AND ((m.user1_id = auth.uid()) OR (m.user2_id = auth.uid()))))));


--
-- Name: community_members Users can view their own memberships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own memberships" ON public.community_members FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: notification_delivery_logs Users can view their own notification delivery logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own notification delivery logs" ON public.notification_delivery_logs FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.notifications n
  WHERE ((n.id = notification_delivery_logs.notification_id) AND (n.user_id = auth.uid())))));


--
-- Name: notification_delivery_logs Users can view their own notification logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own notification logs" ON public.notification_delivery_logs FOR SELECT USING ((((source_table = 'notifications'::text) AND (EXISTS ( SELECT 1
   FROM public.notifications n
  WHERE ((n.id = notification_delivery_logs.notification_id) AND (n.user_id = auth.uid()))))) OR ((source_table = 'pending_notifications'::text) AND (EXISTS ( SELECT 1
   FROM public.pending_notifications pn
  WHERE ((pn.id = notification_delivery_logs.notification_id) AND (pn.user_id = auth.uid()))))) OR ((source_table = 'system'::text) AND (notification_id = '00000000-0000-0000-0000-000000000000'::uuid))));


--
-- Name: notifications Users can view their own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_pacing_preferences Users can view their own pacing preferences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own pacing preferences" ON public.user_pacing_preferences FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING ((auth.uid() = id));


--
-- Name: saved_items Users can view their own saved items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own saved items" ON public.saved_items FOR SELECT TO authenticated USING (((auth.uid() = user_id) OR (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.email ~~ '%@sideby.ai'::text))))));


--
-- Name: user_session_schedules Users can view their own schedules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own schedules" ON public.user_session_schedules FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: sponsorships Users can view their own sponsorships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own sponsorships" ON public.sponsorships FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: upduo_transcripts Users can view their own transcripts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own transcripts" ON public.upduo_transcripts FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: matches View matches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "View matches" ON public.matches FOR SELECT TO authenticated USING (((EXISTS ( SELECT 1
   FROM public.admin_users
  WHERE (admin_users.id = auth.uid()))) OR (auth.uid() = user1_id) OR (auth.uid() = user2_id)));


--
-- Name: admin_alerts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admin_alerts ENABLE ROW LEVEL SECURITY;

--
-- Name: beta_users admin_manage_beta_users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admin_manage_beta_users ON public.beta_users TO authenticated USING (public.is_admin(auth.uid()));


--
-- Name: beta_user_pending_emails admin_manage_pending_emails; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admin_manage_pending_emails ON public.beta_user_pending_emails TO authenticated USING (public.is_admin(auth.uid()));


--
-- Name: admin_users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

--
-- Name: posts admins can insert posts for users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admins can insert posts for users" ON public.posts FOR INSERT TO authenticated WITH CHECK ((public.is_sideby_admin(auth.uid()) OR (auth.uid() = user_id)));


--
-- Name: beta_user_pending_emails; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.beta_user_pending_emails ENABLE ROW LEVEL SECURITY;

--
-- Name: beta_users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.beta_users ENABLE ROW LEVEL SECURITY;

--
-- Name: comments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

--
-- Name: communities; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

--
-- Name: community_feature_flags; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.community_feature_flags ENABLE ROW LEVEL SECURITY;

--
-- Name: community_members; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

--
-- Name: community_pacing; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.community_pacing ENABLE ROW LEVEL SECURITY;

--
-- Name: engagement_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.engagement_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: engagement_stats; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.engagement_stats ENABLE ROW LEVEL SECURITY;

--
-- Name: global_feature_flags; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.global_feature_flags ENABLE ROW LEVEL SECURITY;

--
-- Name: hat_detections; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.hat_detections ENABLE ROW LEVEL SECURITY;

--
-- Name: hat_embeddings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.hat_embeddings ENABLE ROW LEVEL SECURITY;

--
-- Name: hat_similarity_cache; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.hat_similarity_cache ENABLE ROW LEVEL SECURITY;

--
-- Name: match_admin_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.match_admin_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: match_conversation_analysis; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.match_conversation_analysis ENABLE ROW LEVEL SECURITY;

--
-- Name: match_meeting_times; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.match_meeting_times ENABLE ROW LEVEL SECURITY;

--
-- Name: match_scheduling_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.match_scheduling_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: matches; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

--
-- Name: notification_delivery_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notification_delivery_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: pending_match_announcements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pending_match_announcements ENABLE ROW LEVEL SECURITY;

--
-- Name: pending_notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pending_notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: post_visibility; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.post_visibility ENABLE ROW LEVEL SECURITY;

--
-- Name: posts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

--
-- Name: process_gaps; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.process_gaps ENABLE ROW LEVEL SECURITY;

--
-- Name: profile_experiments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profile_experiments ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: saved_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;

--
-- Name: sponsorships; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sponsorships ENABLE ROW LEVEL SECURITY;

--
-- Name: tools; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;

--
-- Name: upduo_session_schedules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.upduo_session_schedules ENABLE ROW LEVEL SECURITY;

--
-- Name: upduo_transcripts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.upduo_transcripts ENABLE ROW LEVEL SECURITY;

--
-- Name: upduo_user_associations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.upduo_user_associations ENABLE ROW LEVEL SECURITY;

--
-- Name: upduo_user_mappings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.upduo_user_mappings ENABLE ROW LEVEL SECURITY;

--
-- Name: user_availability; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_availability ENABLE ROW LEVEL SECURITY;

--
-- Name: user_custom_tools; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_custom_tools ENABLE ROW LEVEL SECURITY;

--
-- Name: user_flow_activities; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_flow_activities ENABLE ROW LEVEL SECURITY;

--
-- Name: user_pacing_preferences; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_pacing_preferences ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: user_session_schedules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_session_schedules ENABLE ROW LEVEL SECURITY;

--
-- Name: user_tools; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_tools ENABLE ROW LEVEL SECURITY;

--
-- Name: posts users can view their own posts and posts they're mentioned in; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "users can view their own posts and posts they're mentioned in" ON public.posts FOR SELECT TO authenticated USING (((auth.uid() = user_id) OR public.is_sideby_admin(auth.uid())));


--
-- Name: values_acknowledgment; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.values_acknowledgment ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: objects Admin can access all transcript files; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Admin can access all transcript files" ON storage.objects USING (((auth.jwt() ->> 'email'::text) ~~ '%@sideby.ai'::text));


--
-- Name: objects Allow authenticated users to upload avatars; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Allow authenticated users to upload avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));


--
-- Name: objects Allow public viewing of avatars; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Allow public viewing of avatars" ON storage.objects FOR SELECT USING ((bucket_id = 'avatars'::text));


--
-- Name: objects Allow users to delete their own avatars; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Allow users to delete their own avatars" ON storage.objects FOR DELETE TO authenticated USING (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));


--
-- Name: objects Allow users to update their own avatars; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Allow users to update their own avatars" ON storage.objects FOR UPDATE TO authenticated USING (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));


--
-- Name: objects Anyone can view avatars; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING ((bucket_id = 'avatars'::text));


--
-- Name: objects Authenticated Users Can Upload Videos; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Authenticated Users Can Upload Videos" ON storage.objects FOR INSERT TO authenticated WITH CHECK ((bucket_id = 'videos'::text));


--
-- Name: objects Authenticated users can upload; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'post_images'::text) AND (auth.role() = 'authenticated'::text)));


--
-- Name: objects Authenticated users can upload avatars; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Authenticated users can upload avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (((bucket_id = 'avatars'::text) AND (auth.uid() = owner)));


--
-- Name: objects Avatar images are publicly accessible; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING ((bucket_id = 'avatars'::text));


--
-- Name: objects Public Access; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ((bucket_id = 'post_images'::text));


--
-- Name: objects Public Access for Videos; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Public Access for Videos" ON storage.objects FOR SELECT USING ((bucket_id = 'videos'::text));


--
-- Name: objects Users can delete their own avatars; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Users can delete their own avatars" ON storage.objects FOR DELETE TO authenticated USING (((bucket_id = 'avatars'::text) AND (auth.uid() = owner)));


--
-- Name: objects Users can update their own avatar; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE TO authenticated USING (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));


--
-- Name: objects Users can update their own avatars; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Users can update their own avatars" ON storage.objects FOR UPDATE TO authenticated USING (((bucket_id = 'avatars'::text) AND (auth.uid() = owner))) WITH CHECK (((bucket_id = 'avatars'::text) AND (auth.uid() = owner)));


--
-- Name: objects Users can upload their own avatar; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT TO authenticated WITH CHECK (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));


--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- Name: supabase_realtime_messages_publication; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime_messages_publication WITH (publish = 'insert, update, delete, truncate');


--
-- Name: supabase_realtime match_admin_messages; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.match_admin_messages;


--
-- Name: supabase_realtime match_scheduling_messages; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.match_scheduling_messages;


--
-- Name: supabase_realtime matches; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.matches;


--
-- Name: supabase_realtime notifications; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.notifications;


--
-- Name: supabase_realtime profiles; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.profiles;


--
-- Name: supabase_realtime saved_items; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.saved_items;


--
-- Name: supabase_realtime_messages_publication messages; Type: PUBLICATION TABLE; Schema: realtime; Owner: -
--

ALTER PUBLICATION supabase_realtime_messages_publication ADD TABLE ONLY realtime.messages;


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


--
-- PostgreSQL database dump complete
--


drop trigger if exists "sync_journey_stage_on_event" on "public"."user_journey_events";

drop function if exists "public"."create_journey_reminder_templates_table"();

drop function if exists "public"."create_journey_stage_config_table"();

drop function if exists "public"."sync_journey_stage"();

create table "public"."journey_stage_config" (
    "id" uuid not null default gen_random_uuid(),
    "stage" text not null,
    "reminder_times" jsonb not null default '{"24h": true, "48h": true, "weekly": true}'::jsonb,
    "welcome_email_enabled" boolean not null default true,
    "welcome_email_delay_hours" integer not null default 0,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."journey_stage_config" enable row level security;

alter table "public"."journey_reminder_logs" enable row level security;

alter table "public"."journey_reminder_templates" enable row level security;

alter table "public"."profiles" alter column "journey_stage" drop not null;

CREATE INDEX idx_journey_stage_config_stage ON public.journey_stage_config USING btree (stage);

CREATE UNIQUE INDEX journey_reminder_templates_stage_type_key ON public.journey_reminder_templates USING btree (stage, reminder_type);

CREATE UNIQUE INDEX journey_stage_config_pkey ON public.journey_stage_config USING btree (id);

CREATE UNIQUE INDEX journey_stage_config_stage_key ON public.journey_stage_config USING btree (stage);

alter table "public"."journey_stage_config" add constraint "journey_stage_config_pkey" PRIMARY KEY using index "journey_stage_config_pkey";

alter table "public"."journey_reminder_templates" add constraint "journey_reminder_templates_stage_type_key" UNIQUE using index "journey_reminder_templates_stage_type_key";

alter table "public"."journey_stage_config" add constraint "journey_stage_config_stage_key" UNIQUE using index "journey_stage_config_stage_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.is_production_environment()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  current_url TEXT;
BEGIN
  -- Get the current Supabase URL from environment
  SELECT current_setting('app.settings.supabase_url', TRUE) INTO current_url;
  
  -- If the setting isn't available, default to checking the actual URL
  IF current_url IS NULL THEN
    -- Default to true if we can't determine the environment
    -- This is safer than accidentally disabling important functions
    RETURN TRUE;
  END IF;
  
  -- Check if the URL contains 'upffcxqiozqhdgfesmji' (production)
  RETURN current_url LIKE '%upffcxqiozqhdgfesmji%';
END;
$function$
;

grant delete on table "public"."journey_stage_config" to "anon";

grant insert on table "public"."journey_stage_config" to "anon";

grant references on table "public"."journey_stage_config" to "anon";

grant select on table "public"."journey_stage_config" to "anon";

grant trigger on table "public"."journey_stage_config" to "anon";

grant truncate on table "public"."journey_stage_config" to "anon";

grant update on table "public"."journey_stage_config" to "anon";

grant delete on table "public"."journey_stage_config" to "authenticated";

grant insert on table "public"."journey_stage_config" to "authenticated";

grant references on table "public"."journey_stage_config" to "authenticated";

grant select on table "public"."journey_stage_config" to "authenticated";

grant trigger on table "public"."journey_stage_config" to "authenticated";

grant truncate on table "public"."journey_stage_config" to "authenticated";

grant update on table "public"."journey_stage_config" to "authenticated";

grant delete on table "public"."journey_stage_config" to "service_role";

grant insert on table "public"."journey_stage_config" to "service_role";

grant references on table "public"."journey_stage_config" to "service_role";

grant select on table "public"."journey_stage_config" to "service_role";

grant trigger on table "public"."journey_stage_config" to "service_role";

grant truncate on table "public"."journey_stage_config" to "service_role";

grant update on table "public"."journey_stage_config" to "service_role";

create policy "Allow admin full access"
on "public"."journey_reminder_logs"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.email ~~ '%@sideby.ai'::text)))));


create policy "Allow authenticated read access"
on "public"."journey_reminder_logs"
as permissive
for select
to public
using ((auth.role() = 'authenticated'::text));


create policy "Allow admin full access"
on "public"."journey_reminder_templates"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.email ~~ '%@sideby.ai'::text)))));


create policy "Allow authenticated read access"
on "public"."journey_reminder_templates"
as permissive
for select
to public
using ((auth.role() = 'authenticated'::text));


create policy "Allow admin full access"
on "public"."journey_stage_config"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.email ~~ '%@sideby.ai'::text)))));


create policy "Allow authenticated read access"
on "public"."journey_stage_config"
as permissive
for select
to public
using ((auth.role() = 'authenticated'::text));


CREATE TRIGGER profile_journey_stage_tracking AFTER UPDATE OF has_completed_reflection ON public.profiles FOR EACH ROW EXECUTE FUNCTION track_journey_stage_change();



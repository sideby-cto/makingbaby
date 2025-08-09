alter table "public"."upduo_transcripts" drop constraint "upduo_transcripts_conversation_id_key";

drop index if exists "public"."upduo_transcripts_conversation_id_key";

CREATE UNIQUE INDEX upduo_transcripts_conversation_id_key ON public.upduo_transcripts USING btree (conversation_id);

alter table "public"."upduo_transcripts" add constraint "upduo_transcripts_conversation_id_key" UNIQUE using index "upduo_transcripts_conversation_id_key";



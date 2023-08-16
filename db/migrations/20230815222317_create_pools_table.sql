-- migrate:up
-- CREATE TABLE public.pools (
-- 	uuid uuid NOT NULL DEFAULT gen_random_uuid(),
-- 	start_timestamp timestamptz NOT NULL,
-- 	stop_timestamp timestamptz NOT NULL,
-- 	CONSTRAINT pools_pkey PRIMARY KEY (uuid)
-- );
-- CREATE INDEX pools_start_timestamp_idx ON public.pools USING btree (start_timestamp);
-- CREATE INDEX pools_stop_timestamp_idx ON public.pools USING btree (stop_timestamp);

-- migrate:down
DROP TABLE IF EXISTS public.pools;

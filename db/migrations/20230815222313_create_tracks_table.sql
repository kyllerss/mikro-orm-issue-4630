-- migrate:up
CREATE TABLE public.tracks (
	uuid uuid NOT NULL DEFAULT gen_random_uuid(),
	start_timestamp timestamptz NOT NULL,
	stop_timestamp timestamptz NOT NULL,
	CONSTRAINT tracks_pkey PRIMARY KEY (uuid)
);
CREATE INDEX tracks_start_timestamp_idx ON public.tracks USING btree (start_timestamp);
CREATE INDEX tracks_stop_timestamp_idx ON public.tracks USING btree (stop_timestamp);

-- migrate:down
DROP TABLE public.tracks;

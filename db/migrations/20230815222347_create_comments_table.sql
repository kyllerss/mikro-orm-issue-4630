-- migrate:up
CREATE TABLE public."comments" (
	uuid uuid NOT NULL DEFAULT gen_random_uuid(),
	"type" varchar NOT NULL,
	-- message varchar NULL,
	-- creation_timestamp timestamptz NOT NULL DEFAULT now(),
	-- last_modified_timestamp timestamptz NOT NULL DEFAULT now(),
	-- track_uuid uuid NULL,
	-- pool_uuid uuid NULL,
	-- discussion_uuid uuid NULL,
	CONSTRAINT comments_pk PRIMARY KEY (uuid) --,
	-- CONSTRAINT comments_fk FOREIGN KEY (pool_uuid) REFERENCES public.pools(uuid),
	-- CONSTRAINT comments_fk_1 FOREIGN KEY (track_uuid) REFERENCES public.tracks(uuid),
	-- CONSTRAINT comments_fk_2 FOREIGN KEY (discussion_uuid) REFERENCES public."comments"(uuid)
);
CREATE INDEX comments_type_idx ON public.comments USING btree (type);

-- migrate:down
DROP TABLE public."comments";

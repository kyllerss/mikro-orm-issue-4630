-- migrate:up
CREATE TABLE public."comments" (
	uuid uuid NOT NULL DEFAULT gen_random_uuid(),
	"type" varchar NOT NULL,
	CONSTRAINT comments_pk PRIMARY KEY (uuid)
);
CREATE INDEX comments_type_idx ON public.comments USING btree (type);

-- migrate:down
DROP TABLE public."comments";

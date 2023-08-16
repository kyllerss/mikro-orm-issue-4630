-- migrate:up
CREATE TABLE public.pictures (
	uuid uuid NOT NULL DEFAULT gen_random_uuid(),
	"type" varchar NOT NULL,
	comment_uuid uuid NULL,
	CONSTRAINT pictures_pk PRIMARY KEY (uuid),
	CONSTRAINT pictures_fk_1 FOREIGN KEY (comment_uuid) REFERENCES public."comments"(uuid)
);
CREATE INDEX pictures_type_idx ON public.pictures USING btree (type);

-- migrate:down
DROP TABLE public.pictures;

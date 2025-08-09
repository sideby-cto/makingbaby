# Makefile for syncing functions from staging to development
ENV_FILE=.env.development.local

pull-functions:
	@ENV_PATH="$(ENV_FILE)" ./scripts/pull-functions.sh

push-functions:
	@ENV_PATH="$(ENV_FILE)" ./scripts/push-functions.sh

sync-schema:
	@ENV_PATH="$(ENV_FILE)" ./scripts/sync-schema.sh
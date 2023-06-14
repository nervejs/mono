#!/usr/bin/env bash

set -e

function kill_processes() {
	echo "";

	echo "KILL TS $pid_ts";
	kill -9 "$pid_ts";

	echo "KILL TSC ALIAS $pid_tsc_alias";
	kill -9 "$pid_tsc_alias";

	exit 0;
}

#npm run build

npm run ts -- -w &
pid_ts=$!

npm run tsc-alias -- -w &
pid_tsc_alias=$!

trap kill_processes SIGHUP SIGINT SIGTERM
wait

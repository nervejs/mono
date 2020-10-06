#!/usr/bin/env bash

function kill_processes() {
	echo "KILL BUILD $pid_build";
	kill -9 "$pid_build";

	echo "KILL TYPE CHECK $pid_type_check";
	kill -9 "$pid_type_check";

	exit 0;
}

npm run dev &
pid_build=$!

npm run type-check:watch &
pid_type_check=$!

trap kill_processes SIGHUP SIGINT SIGTERM
wait

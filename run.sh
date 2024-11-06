#!/bin/bash

curl -XPOST localhost:3000/analyse \
  -H "Content-Type: application/json" \
  -d '[]'

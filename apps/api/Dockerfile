FROM golang:1.26-alpine AS build

WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 go build \
    -trimpath \
    -ldflags="-s -w" \
    -o /out/ledgera-api \
    ./cmd/api

FROM alpine:3.23

RUN apk add --no-cache ca-certificates \
    && addgroup -S ledgera \
    && adduser -S -G ledgera ledgera

COPY --from=build /out/ledgera-api /usr/local/bin/ledgera-api

USER ledgera
EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/ledgera-api"]

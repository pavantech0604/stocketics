# Build context is the api/ folder:  docker build -t stocketics-api api/
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY Stocketics.slnx ./
COPY src/ src/
RUN dotnet publish src/Stocketics.Api/Stocketics.Api.csproj -c Release -o /app --no-self-contained

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app ./
# Run as the non-root user that the aspnet image already ships with.
USER $APP_UID
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "Stocketics.Api.dll"]

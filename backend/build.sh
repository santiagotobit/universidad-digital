#!/bin/bash

# =========================
# CONFIGURACIÓN
# =========================
PROJECT_ID="despliegue-dev-senior"
REGION="us-central1"
REPO="universidad-repo"
IMAGE_NAME="cloud-run-plataforma-universidad"
TAG="v1"

# =========================
# VALIDACIONES
# =========================
echo "Verificando proyecto activo..."
gcloud config set project $PROJECT_ID

if [ $? -ne 0 ]; then
  echo "❌ Error configurando el proyecto"
  exit 1
fi

# =========================
# AUTENTICACIÓN DOCKER
# =========================
echo "Autenticando Docker con Artifact Registry..."
gcloud auth configure-docker $REGION-docker.pkg.dev -q

# =========================
# BUILD Y PUSH
# =========================
IMAGE_URI="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/$IMAGE_NAME:$TAG"

echo "Construyendo imagen: $IMAGE_URI"

gcloud builds submit --tag $IMAGE_URI

if [ $? -ne 0 ]; then
  echo "❌ Error en el build"
  exit 1
fi

echo "✅ Imagen construida y subida correctamente"

# =========================
# OPCIONAL: DEPLOY A CLOUD RUN
# =========================
SERVICE_NAME="cloud-run-plataforma-universidad"

echo "Desplegando en Cloud Run..."

gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_URI \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated

if [ $? -ne 0 ]; then
  echo "❌ Error en el deploy"
  exit 1
fi

echo "🚀 Deploy completado en Cloud Run"
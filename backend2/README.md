# IoT Sensor Backend (Node.js/Express)

## Fonctionnalités
- Reçoit les données du microcontrôleur (format JSON array)
- Stocke en base Postgres
- Relaye à Sensor Community
- Dockerisé (Node + Postgres)

## Démarrage rapide

1. Copier `.env.example` en `.env` et adapter si besoin
2. Lancer :
   ```sh
   docker-compose up --build
   ```
3. L’API écoute sur `http://localhost:3000/api/sensors`

## Format attendu (POST)
```json
[
  {
    "name": "temperature",
    "value": 22.3,
    "unit": "C",
    "timestamp": 1718180000
  }
]
```

## Variables d’environnement
Voir `.env.example`.

## Modèle SQL
- name (string)
- value (float)
- unit (string)
- timestamp (bigint)

---

Pour toute question ou évolution, voir le code ou demander !

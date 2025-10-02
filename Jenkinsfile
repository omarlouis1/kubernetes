// Jenkinsfile pour un projet Node.js + Docker
// Ce pipeline clone le projet, installe les dépendances, build une image Docker,
// pousse l'image sur DockerHub, déploie un conteneur et envoie des notifications par email.

pipeline {
    // Exécution sur n'importe quel agent disponible
    agent any

    // Variables d'environnement globales
    environment {
        PATH = "/usr/bin:/usr/local/bin:${env.PATH}"  // Assure que Jenkins trouve npm et node
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials') // ID Jenkins pour DockerHub
        IMAGE_NAME = "seynabou26/full_stack_app"                     // Nom de l'image Docker
    }

    // Définition des différentes étapes du pipeline
    stages {

        // Étape 1 : Cloner le code depuis GitHub
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/Seynabou26/full_stack_app.git'
            }
        }

        // Étape 2 : Installer les dépendances du backend
        stage('Install Backend Dependencies') {
            steps {
                dir('back') {
                    sh 'npm install'
                }
            }
        }

        // Étape 3 : Installer et builder le frontend
        stage('Install & Build Frontend') {
            steps {
                dir('front') {
                    sh 'npm install && npm run build'
                }
            }
        }

        // Étape 4 : Builder l'image Docker
        stage('Build Docker Image') {
            steps {
                script {
                    docker.build("${IMAGE_NAME}:latest")
                }
            }
        }

        // Étape 5 : Push de l'image sur DockerHub
        stage('Push Docker Image') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-credentials') {
                        docker.image("${IMAGE_NAME}:latest").push()
                    }
                }
            }
        }

        // Étape 6 : Déploiement du conteneur
        stage('Deploy Container') {
            steps {
                sh 'docker run -d -p 3000:3000 --name full_stack_app ${IMAGE_NAME}:latest'
            }
        }
    }

    // Post-actions exécutées après la fin du pipeline
    post {

        // Si le build réussit
        success {
            emailext (
                subject: "✅ Build SUCCESS: ${JOB_NAME} #${BUILD_NUMBER}",
                body: "Le pipeline ${JOB_NAME} s'est terminé avec succès.\nURL du build: ${BUILD_URL}",
                to: 'seynaboubadji26@gmail.com'
            )
        }

        // Si le build échoue
        failure {
            emailext (
                subject: "❌ Build FAILED: ${JOB_NAME} #${BUILD_NUMBER}",
                body: """Le pipeline ${JOB_NAME} a échoué.
URL du build: ${BUILD_URL}""",
                to: 'seynaboubadji26@gmail.com'
            )
        }
    }
}

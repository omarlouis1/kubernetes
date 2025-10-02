pipeline {
    agent {
        docker { image 'node:20-alpine' } // Agent Docker avec Node.js préinstallé
    }

    environment {
        // Met ici les credentials DockerHub si besoin
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-id')
        PATH = "/usr/local/bin:/usr/bin:${env.PATH}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                dir('back') {
                    sh 'npm install'
                }
            }
        }

        stage('Install & Build Frontend') {
            steps {
                dir('front') {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh 'docker build -t seynabou26/full_stack_app:latest .'
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    sh 'docker login -u $DOCKERHUB_CREDENTIALS_USR -p $DOCKERHUB_CREDENTIALS_PSW'
                    sh 'docker push seynabou26/full_stack_app:latest'
                }
            }
        }

        stage('Deploy Container') {
            steps {
                script {
                    // Stop et supprime le conteneur existant si besoin
                    sh 'docker rm -f full_stack_app || true'
                    // Lancer le conteneur
                    sh 'docker run -d -p 8080:8080 -p 5000:5000 --name full_stack_app seynabou26/full_stack_app:latest'
                }
            }
        }
    }

    /*post {
        failure {
            emailext(
                subject: "❌ Build FAILED: ${JOB_NAME} #${BUILD_NUMBER}",
                body: """Le pipeline ${JOB_NAME} a échoué.
URL du build: ${BUILD_URL}""",
                to: 'seynaboubadji26@gmail.com'
            )
        }
    }*/
}

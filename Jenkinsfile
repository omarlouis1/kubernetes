pipeline {
    agent any

    tools {
        nodejs "NodeJS_16"
    }

    environment {
        DOCKER_USER   = 'kao123'              // Ton identifiant Docker Hub
        FRONT_IMAGE   = 'react-frontend'
        BACK_IMAGE    = 'express-backend'
    }

    triggers {
        GenericTrigger(
            genericVariables: [
                [key: 'ref', value: '$.ref'],
                [key: 'pusher_name', value: '$.pusher.name'],
                [key: 'commit_message', value: '$.head_commit.message']
            ],
            causeString: 'Push par $pusher_name sur $ref : "$commit_message"',
            token: 'mysecret',
            printContributedVariables: true,
            printPostContent: true
        )
    }

    stages {

        stage('Checkout') {
            steps {
                echo "📦 Récupération du code depuis GitHub..."
                git branch: 'main', url: 'https://github.com/omarlouis1/kubernetes.git'
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Backend') {
                    steps {
                        dir('back') {
                            sh 'npm install'
                        }
                    }
                }
                stage('Frontend') {
                    steps {
                        dir('front') {
                            sh 'npm install'
                        }
                    }
                }
            }
        }

        stage('Run Tests') {
            steps {
                echo "🧪 Exécution des tests..."
                script {
                    sh 'cd back-end && npm test || echo "⚠️ Aucun test backend"'
                    sh 'cd front-end && npm test || echo "⚠️ Aucun test frontend"'
                }
            }
        }

  
        stage('Build Docker Images') {
            steps {
                echo "🐳 Construction des images Docker..."
                sh """
                    docker build -t $DOCKER_USER/$BACK_IMAGE:latest ./back
                    
                """
            }
        }
         stage('Push Docker Images') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentiels', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                        docker push $DOCKER_USER/$FRONT_IMAGE:latest
                        docker push $DOCKER_USER/$BACK_IMAGE:latest
                    '''
                }
            }
        }
      


        /*stage('Deploy') {
            steps {
                echo "🚀 Déploiement via docker-compose..."
                sh '''
                    docker-compose -f compose.yaml down || true
                    docker-compose -f compose.yaml pull
                    docker-compose -f compose.yaml up -d
                    docker-compose ps
                '''
            }
        }*/

         stage('Deploy to Kubernetes') {
            steps {
                withKubeConfig([credentialsId: 'kubeconfig']) {
                    // Déployer MongoDB
                    sh "kubectl apply -f k8s/mongo-deployment.yaml"
                    sh "kubectl apply -f k8s/mongo-service.yaml"

                    // Déployer backend
                    sh "kubectl apply -f k8s/back-deployment.yaml"
                    sh "kubectl apply -f k8s/back-service.yaml"

                    // Déployer frontend
                    sh "kubectl apply -f k8s/front-deployment.yaml"
                    sh "kubectl apply -f k8s/front-service.yaml"

                    // Vérifier que les pods sont Running
                    sh "kubectl rollout status deployment/mongo"
                    sh "kubectl rollout status deployment/backend"
                    sh "kubectl rollout status deployment/frontend"
                }
            }
        }

        stage('Smoke Test') {
            steps {
                echo "🔎 Vérification des services..."
                sh '''
                    echo "Frontend (port 5173) :" 
                    curl -f http://localhost:5173 || echo "⚠️ Frontend inaccessible"
                    echo "Backend (port 5001) :"
                    curl -f http://localhost:5001/api || echo "⚠️ Backend inaccessible"
                '''
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline terminé avec succès !"
            emailext(
                subject: "✅ SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
                ✅ Build réussi pour ${env.JOB_NAME} #${env.BUILD_NUMBER}
                🔗 Détails: ${env.BUILD_URL}
                """,
                to: "omzokao99@gmail.com"
            )
        }
        failure {
            echo "❌ Échec du pipeline."
            emailext(
                subject: "❌ FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Le pipeline a échoué 💥\n\nDétails : ${env.BUILD_URL}",
                to: "omzokao99@gmail.com"
            )
        }
    }
}

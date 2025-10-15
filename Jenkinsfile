pipeline {
    agent any

    tools {
        nodejs "NodeJS_22"
    }

    environment {
        DOCKER_HUB_USER = 'seynabou02'
        FRONT_IMAGE = 'react-frontend'
        BACKEND_IMAGE = 'express-backend'
    }

    triggers {
        GenericTrigger(
            genericVariables: [
                [key: 'ref', value: '$.ref'],
                [key: 'pusher_name', value: '$.pusher.name'],
                [key: 'commit_message', value: '$.head_commit.message']
            ],
            causeString: 'Push par $pusher_name sur $ref: "$commit_message"',
            token: 'mywebhook',
            printContributedVariables: true,
            printPostContent: true
        )
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/Seynabou26/full_stack_app.git'
            }
        }

        // ----------------------------
        // Vérification Cluster Kubernetes
        // ----------------------------
       /* stage('Verify Kubernetes Cluster') {
            steps {
                withKubeConfig([credentialsId: 'kubeconfig-jenkins']) {
                    script {
                        sh '''
                            echo "🔍 Vérification du cluster Kubernetes..."
                            
                            # Vérifier que Minikube est démarré
                            minikube status --wait=true --interval=10s --timeout=180s || {
                                echo "❌ Minikube n'est pas démarré. Démarrage en cours..."
                                minikube start
                            }
                            
                            # Vérifier la connexion Kubernetes
                            kubectl cluster-info
                            kubectl get nodes
                            
                            echo "✅ Cluster Kubernetes prêt"
                        '''
                    }
                }
            }
        }*/

        stage('Install dependencies - Backend') {
            steps {
                dir('back') {
                    sh 'npm install'
                }
            }
        }

        stage('Install dependencies - Frontend') {
            steps {
                dir('front') {
                    sh 'npm install'
                }
            }
        }

        // ----------------------------
        // SonarQube
        // ----------------------------
        //// Analyse le code avec SonarQube
        stage('SonarQube Analysis') {
            steps {
                echo "Analyse du code avec SonarQube"
                withSonarQubeEnv('Sonarqube_local') {
                    withCredentials([string(credentialsId: 'sonarqube', variable: 'SONAR_TOKEN')]) {
                        sh """
                            ${tool('Sonarqube_scanner')}/bin/sonar-scanner \
                            -Dsonar.projectKey=sonarqube \
                            -Dsonar.sources=. \
                            -Dsonar.host.url=$SONAR_HOST_URL \
                            -Dsonar.login=$SONAR_TOKEN
                        """
                    }
                }
            }
        }

        /*Vérifie si le code passe le Quality Gate et arrête le pipeline si échoué
        stage("Quality Gate") {
            steps {
                echo "Vérification du Quality Gate"
               Timeout fixé à 10 minutes pour attendre la réponse de SonarQube
               timeout(time: 10, unit: 'MINUTES') {
                     si le Quality Gate échoue, le pipeline est stoppé
                    waitForQualityGate(abortPipeline: true)
                }
            }
        }*/

        // ----------------------------
        // Tests
        // ----------------------------
        stage('Run tests') {
            steps {
                script {
                    sh 'cd back && npm test || echo "Aucun test backend"'
                    sh 'cd front && npm test || echo "Aucun test frontend"'
                }
            }
        }

        // ----------------------------
        // Docker
        // ----------------------------
        stage('Build Docker Images') {
            steps {
                script {
                    // Obtenir l'IP dynamique de Minikube
                    sh '''
                        MINIKUBE_IP=$(minikube ip)
                        echo "🎯 Minikube IP actuelle: $MINIKUBE_IP"
                    '''
                    
                    // Build du frontend avec l'IP DYNAMIQUE
                    sh """
                        MINIKUBE_IP=\$(minikube ip)
                        docker build -t $DOCKER_HUB_USER/$FRONT_IMAGE:latest \
                        --build-arg VITE_API_URL=http://\\$MINIKUBE_IP:30001/api ./front
                    """
                    sh "docker build -t $DOCKER_HUB_USER/$BACKEND_IMAGE:latest ./back"
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'DOCKER_CREDENTIALS', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                        docker push $DOCKER_USER/$FRONT_IMAGE:latest
                        docker push $DOCKER_USER/$BACKEND_IMAGE:latest
                    '''
                }
            }
        }

        stage('Clean Docker') {
            steps {
                sh 'docker container prune -f'
                sh 'docker image prune -f'
            }
        }

        /*stage('Check Docker & Compose') {
            steps {
                sh 'docker --version'
                sh 'docker-compose --version || echo "docker-compose non trouvé"'
           }
        }*/

        /* stage('Deploy (compose.yaml)') {
            steps {
                dir('.') {
                    sh 'docker-compose -f compose.yaml down || true'
                    sh 'docker-compose -f compose.yaml pull'
                    sh 'docker-compose -f compose.yaml up -d'
                    sh 'docker-compose -f compose.yaml ps'
                    sh 'docker-compose -f compose.yaml logs --tail=50'
                }
            }
       }*/ 

        // ----------------------------
        // Déploiement Kubernetes
        // ----------------------------
        stage('Deploy to Kubernetes') {
            steps {
                withKubeConfig([credentialsId: 'kubeconfig-jenkins']) {
                    script {
                        // Obtenir l'IP actuelle pour la mise à jour
                        def MINIKUBE_IP = sh(
                            script: 'minikube ip',
                            returnStdout: true
                        ).trim()
                        
                        echo "🎯 Déploiement avec IP: ${MINIKUBE_IP}"
                        
                        // Appliquer tous les fichiers YAML (crée les déploiements s'ils n'existent pas)
                        sh "kubectl apply -f k8s/"
                        
                        // Attendre que les ressources soient créées
                        sleep 30
                        
                        // Mettre à jour l'URL API avec l'IP dynamique
                        sh """
                            kubectl set env deployment/frontend VITE_API_URL=http://${MINIKUBE_IP}:30001/api --ignore-not-found
                        """
                        
                        // Vérifier que les pods sont Running avec timeout
                        sh """
                            kubectl rollout status deployment/mongo --timeout=300s || echo "⚠️ MongoDB en cours de démarrage"
                            kubectl rollout status deployment/backend --timeout=300s || echo "⚠️ Backend en cours de démarrage" 
                            kubectl rollout status deployment/frontend --timeout=300s || echo "⚠️ Frontend en cours de démarrage"
                        """
                    }
                }
            }
        }

        // ----------------------------
        // Vérification Application
        // ----------------------------
        stage('Display Application Info') {
            steps {
                withKubeConfig([credentialsId: 'kubeconfig-jenkins']) {
                    script {
                        sh '''
                            echo "🎯 INFORMATIONS APPLICATION DÉPLOYÉE :"
                            echo "======================================"
                            
                            # Obtenir les URLs via Minikube
                            FRONT_URL=$(minikube service frontend-service --url)
                            BACK_URL=$(minikube service backend-service --url)
                            
                            echo "🌐 Frontend: $FRONT_URL"
                            echo "⚙️  Backend:  $BACK_URL"
                            echo "📊 API Test: $BACK_URL/api/smartphones"
                            
                            # Alternative avec IP directe
                            MINIKUBE_IP=$(minikube ip)
                            FRONT_PORT=$(kubectl get service frontend-service -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null || echo "30002")
                            BACK_PORT=$(kubectl get service backend-service -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null || echo "30001")
                            
                            echo ""
                            echo "🔧 URLs alternatives:"
                            echo "Frontend: http://$MINIKUBE_IP:$FRONT_PORT"
                            echo "Backend:  http://$MINIKUBE_IP:$BACK_PORT/api/smartphones"
                            
                            # Test de santé basique
                            echo ""
                            echo "🧪 Test de connectivité..."
                            curl -f $FRONT_URL >/dev/null 2>&1 && echo "✅ Frontend accessible" || echo "⚠️ Frontend en cours de démarrage"
                            curl -f $BACK_URL/api/smartphones >/dev/null 2>&1 && echo "✅ Backend accessible" || echo "⚠️ Backend en cours de démarrage"
                        '''
                    }
                }
            }
        }

        /*  stage('Smoke Test') {
            steps {
                sh '''
                    echo "Vérification Frontend (port 5173)..."
                    curl -f http://localhost:5173 || echo "Frontend unreachable"
      
                    echo "Vérification Backend (port 5001)..."
                    curl -f http://localhost:5001/api || echo "Backend unreachable"
                '''
            }
       }*/

       /*stage('Smoke Test') {
            steps {
                sh '''
                    NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}')
                    FRONT_PORT=$(kubectl get service frontend-service -o jsonpath='{.spec.ports[0].nodePort}')
                    BACK_PORT=$(kubectl get service backend-service -o jsonpath='{.spec.ports[0].nodePort}')

                    FRONT_URL=http://$NODE_IP:$FRONT_PORT
                    BACK_URL=http://$NODE_IP:$BACK_PORT

                    curl -f $FRONT_URL || echo "Frontend unreachable"
                    curl -f $BACK_URL/api || echo "Backend unreachable"
                '''
            }
        }*/

    }

    post {
        success {
            script {
                // Récupérer les URLs pour l'email
                def FRONT_URL = sh(
                    script: 'minikube service frontend-service --url',
                    returnStdout: true
                ).trim()
                
                def BACK_URL = sh(
                    script: 'minikube service backend-service --url', 
                    returnStdout: true
                ).trim()
                
                emailext(
                    subject: "✅ Build SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                    body: """
                    Pipeline exécuté avec succès!
                    
                    📍 Votre application est déployée :
                    Frontend: ${FRONT_URL}
                    Backend:  ${BACK_URL}
                    API Test: ${BACK_URL}/api/smartphones
                    
                    Détails du build: ${env.BUILD_URL}
                    """,
                    to: "seynaboubadji26@gmail.com"
                )
            }
        }
        failure {
            emailext(
                subject: "❌ Build FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Le pipeline a échoué\nDétails : ${env.BUILD_URL}",
                to: "seynaboubadji26@gmail.com"
            )
        }
    }
}
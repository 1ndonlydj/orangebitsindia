
pipeline{

	agent any

	
	stages {

		stage('Build') {

			steps {
				sh '''
				COMMITID=$(git rev-parse --short HEAD) \
			        && export COMMITID=$COMMITID && echo $COMMITID
			        echo $COMMITID
			        sed -i 's/__BUILDID__/'"$COMMITID"'/g' ./app/index.js
				docker build -t 1ndonlydj/orangebitsindia:latest ./app/ --no-cache
				'''
               
			}
		}
        
        stage('login') {

            steps {
        
		        withCredentials([string(credentialsId: 'DOCKER_PWD', variable: 'PASSWORD')]) {
                    sh 'docker login -u 1ndonlydj -p $PASSWORD'
                }
            }
        }
		stage('Push') {

			steps {
				sh 'docker push 1ndonlydj/orangebitsindia:latest'
			}
		}
		stage ('Fetch Git Info') {
			steps {
			sh '''
			COMMITID=$(git rev-parse --short HEAD) \
			&& export COMMITID=$COMMITID && echo $COMMITID
			'''
			}
		}

        stage('eks deploy') {

		steps {
			sh '''
      COMMITID=$(git rev-parse --short HEAD) \
      && export COMMITID=$COMMITID && echo $COMMITID
      echo $COMMITID
      sed -i 's/__GIT_COMMIT__/'"$COMMITID"'/g' nscreate.yaml
      kubectl apply -f nscreate.yaml
      kubectl get secret regcred --namespace=default -oyaml | grep -v "namespace" | kubectl apply --namespace=$COMMITID -f - 2>/dev/null || true
      sed -i 's/__GIT_COMMIT__/'"$COMMITID"'/g' deploy.yaml
      kubectl apply -f deploy.yaml
      '''
		      }
		}

		stage('route53 modulation') {

		steps {
			sh '''
sleep 60
COMMITID=$(git rev-parse --short HEAD) \
&& export COMMITID=$COMMITID && echo $COMMITID
echo $COMMITID
HOSTED_ZONE_ID=$( \
    aws route53 list-hosted-zones \
    --query "HostedZones[?Name=='assessment.orangebitsindia.com.'].Id" \
    --output text) \
  && echo ${HOSTED_ZONE_ID}

CHECK_R53_RECORD=$( \
    aws route53 list-resource-record-sets \
    --hosted-zone-id ${HOSTED_ZONE_ID} \
    --query "ResourceRecordSets[?Name == '$COMMITID.assessment.orangebitsindia.com.']" | jq -r '.[0]') \
  && echo ${CHECK_R53_RECORD}

if [ "${CHECK_R53_RECORD}" = "null" ];
  then
    ALB_ENDPOINT="$(kubectl get ing -n $COMMITID | awk '{print $4}' | tail -n 1)"
    export ALB_ENDPOINT="$(echo $ALB_ENDPOINT | sed 's/^/"/;s/$/"/')"
    echo $ALB_ENDPOINT
    HOST="$(echo "$COMMITID.assessment.orangebitsindia.com" | sed 's/^/"/;s/$/"/')"
    export HOST=$HOST
    echo $HOST
    aws route53 change-resource-record-sets \
    --hosted-zone-id ${HOSTED_ZONE_ID} \
    --change-batch \
    "{
      "'"Changes"'": [
        {
          "'"Action"'": "'"CREATE"'",
          "'"ResourceRecordSet"'": {
            "'"Name"'": "${HOST}",
            "'"Type"'": "'"CNAME"'",
            "'"TTL"'": 300,
            "'"ResourceRecords"'": [{"'"Value"'": "${ALB_ENDPOINT}"}]
          }
        }
      ]
    }"
  else
    echo "DNS record already exists"
  fi
'''
		      }
		}
	}
	
	post {
		always {

            		cleanWs()
			
            		echo "done"
		}
	}

}

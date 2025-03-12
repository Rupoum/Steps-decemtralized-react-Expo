import React, { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";
import GoogleFit, { Scopes } from "react-native-google-fit";

export const GoogleFitComponent = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    GoogleFit.checkIsAuthorized().then(() => {
      setIsAuthorized(GoogleFit.isAuthorized);
    });

    const subscription = GoogleFit.onAuthorize(() => {
      setIsAuthorized(true);
    });

    return () => {
    //   subscription.remove();
    };
  }, []);

  const handleAuthorize = () => {
    GoogleFit.authorize({
      scopes: [
        Scopes.FITNESS_ACTIVITY_READ,
         Scopes.FITNESS_ACTIVITY_WRITE,
        Scopes.FITNESS_BODY_READ,
        Scopes.FITNESS_BODY_WRITE,
      ],
    })
      .then(() => {
        console.log("Authorization successful");
        setIsAuthorized(true);
      })
      .catch((err) => {
        console.log("Authorization error: ", err);
      });
  };

  return (
    <View>
      {isAuthorized ? (
        <Text>Google Fit is authorized!</Text>
      ) : (
        <Button title="Authorize Google Fit" onPress={handleAuthorize} />
      )}
    </View>
  );
};

export default GoogleFitComponent;
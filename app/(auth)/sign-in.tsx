import {View, Text} from 'react-native'
import {Link} from "expo-router";

const SignIn = () => {
    return (
        <View>
            <Text>SignIn</Text>
            <Link href="/(auth)/sign-up">Create Account</Link>
            <Link href="/">Back to Homepage</Link>
        </View>
    )
}
export default SignIn

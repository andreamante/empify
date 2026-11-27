import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.util.Base64;

public class GenerateJwtKeys {
    public static void main(String[] args) throws Exception {
        if (args.length != 1) {
            throw new IllegalArgumentException("Expected the JWT key directory path");
        }

        Path directory = Path.of(args[0]);
        Path privateKey = directory.resolve("privateKey.pem");
        Path publicKey = directory.resolve("publicKey.pem");
        Files.createDirectories(directory);

        if (Files.exists(privateKey) && Files.exists(publicKey)) {
            return;
        }
        if (Files.exists(privateKey) || Files.exists(publicKey)) {
            throw new IOException("Only one JWT key exists; move both keys away before generating a new pair");
        }

        KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
        generator.initialize(2048);
        KeyPair keyPair = generator.generateKeyPair();

        Files.writeString(privateKey, pem("PRIVATE KEY", keyPair.getPrivate().getEncoded()),
                StandardCharsets.US_ASCII);
        try {
            Files.writeString(publicKey, pem("PUBLIC KEY", keyPair.getPublic().getEncoded()),
                    StandardCharsets.US_ASCII);
        } catch (IOException exception) {
            Files.deleteIfExists(privateKey);
            throw exception;
        }
    }

    private static String pem(String label, byte[] encoded) {
        String base64 = Base64.getMimeEncoder(64, new byte[]{'\n'}).encodeToString(encoded);
        return "-----BEGIN " + label + "-----\n" + base64 + "\n-----END " + label + "-----\n";
    }
}

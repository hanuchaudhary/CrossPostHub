import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-neutral-400 hover:text-emerald-500 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
        </Link>
      </div>

      <h1 className="mb-8 text-4xl font-ClashDisplayMedium tracking-wide text-emerald-500">
        Terms of Service
      </h1>

      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <MapPin className="h-5 w-5 text-primary mt-1" />
          <div>
            <h3 className="font-medium text-xl">Registered Address:</h3>
            <p className="text-muted-foreground">
              Village - Peepali Kalan
              <br />
              Post-Nagla Jagdev
              <br />
              Aligarh, UTTAR PRADESH 202123
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <Phone className="h-5 w-5 text-primary mt-1" />
          <div>
            <h3 className="font-medium text-xl">Telephone:</h3>
            <p className="text-muted-foreground">7505420980</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <Mail className="h-5 w-5 text-primary mt-1" />
          <div>
            <h3 className="font-medium text-xl">Email:</h3>
            <p className="text-muted-foreground">hanuchaudharyog@gmail.com</p>
          </div>
        </div>
      </div>

      <div className="mt-10 border-t pt-6">
        <p className="text-center text-muted-foreground">
          Merchant Legal entity name: KUSH CHAUDHARY
        </p>
      </div>
    </div>
  );
}

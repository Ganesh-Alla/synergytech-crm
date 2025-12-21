import Image from "next/image";
import Link from "next/link";

export const Logo = () => {
  
    return (
             <Link href="/" className="flex items-center">
                <Image
                  src="/icon.jpeg" 
                  alt="SynergyTech CRM" 
                  width={150} 
                  height={150} 
                  priority 
                  className="w-8 h-12 -mr-1 hidden group-data-[collapsible=icon]:block"
                />
                <Image src="/Logo.jpeg" alt="SynergyTech CRM" width={150} height={150} priority className="group-data-[collapsible=icon]:hidden"/>
              </Link>
    );
  };
  
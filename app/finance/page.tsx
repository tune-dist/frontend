'use client'

import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export default function FinancePage() {
    return (
        <main className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <h1 className="text-4xl font-bold mb-6">Finance</h1>
                <p className="text-lg text-muted-foreground">
                    Track your earnings and royalties in one place.
                </p>
                {/* Placeholder for future finance content */}
                <div className="mt-12 p-8 border border-border rounded-lg bg-card">
                    <p className="text-muted-foreground">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatibus cum tempore, eaque natus, exercitationem assumenda earum saepe unde ipsum itaque voluptas iste aperiam eveniet doloremque nemo corrupti expedita, culpa nostrum distinctio laudantium! Nam quae soluta voluptas nobis fuga tempore ipsum incidunt veniam qui! Nostrum dicta consequuntur sit maxime numquam quos? Eum ducimus ad architecto, incidunt, eos assumenda doloribus perspiciatis accusamus ab atque dolores ratione perferendis corrupti vitae inventore distinctio cum blanditiis earum officiis voluptates quo eligendi deleniti quibusdam.<br /><br /> Delectus sed rem et provident doloribus dignissimos officia esse sit, ipsa ratione quis perspiciatis repellendus facere quam. Aliquid, dolore iusto sunt ut animi deleniti aut est accusamus unde. Porro nesciunt assumenda, obcaecati magni, eligendi iusto tempore autem perspiciatis sequi dolore alias dolores debitis! Perspiciatis iste, dicta esse voluptates placeat veritatis provident hic in, vel omnis consequuntur, nesciunt voluptatibus praesentium nostrum.<br /><br /> Unde sint asperiores, veritatis placeat reiciendis dolorem ad hic recusandae itaque debitis! Et ipsa modi eos! Alias quod, voluptate beatae iure dolores iste quaerat suscipit? Unde consequatur dolores magnam corporis autem, soluta pariatur sint ex aliquam, nobis ipsum, temporibus animi! Eligendi nihil quos quo quis ex omnis assumenda suscipit tempora animi, maiores ullam obcaecati minima. Suscipit odit eaque saepe voluptatibus cumque totam non dignissimos blanditiis illum hic reiciendis neque facilis voluptatum vero distinctio fuga cupiditate eligendi dolorum voluptate nesciunt, sunt, commodi optio rem similique.<br /><br /> Minus magnam tempore quisquam debitis quas iusto deserunt, est alias qui dolorum autem saepe laboriosam officiis consectetur, corporis quos? Numquam, eius. Laboriosam veritatis quasi doloribus necessitatibus non iste rem sed saepe reiciendis. Possimus quibusdam ut aspernatur ipsa rerum quaerat ea aliquam accusamus minus eum quae id corrupti repudiandae repellendus laudantium doloribus porro labore sint provident quam dicta nesciunt, amet culpa. Rerum ipsum dolor quam iure voluptas impedit distinctio architecto quasi dignissimos necessitatibus ducimus, sapiente culpa amet praesentium incidunt.
                    </p>
                </div>
            </div>
            <Footer />
        </main>
    )
}

// ===================== DATA GALERI KEGIATAN =====================
// Setiap kegiatan punya "id" unik yang dipakai sebagai link:
//   kegiatan/?id=0, kegiatan/?id=1, dst.
// Untuk menambah kegiatan baru: copy salah satu object di bawah,
// ganti id (urut, tidak boleh sama), lalu isi title/tag/cat/date/image/excerpt/body.
// image: ganti dengan foto dokumentasi asli kegiatan tsb (taruh file-nya di folder assets/img/).

const GALERI_DATA = [
  {
    id: 0,
    gClass: 'g1',
    tag: 'Pelatihan',
    cat: 'pelatihan',
    title: 'Pelatihan Wasit Sepak Bola',
    date: '18 Januari 2026',
    image: 'assets/img/foto_beranda.jpg',
    excerpt: 'Dokumentasi kegiatan pelatihan wasit sepak bola bagi anggota KKG PJOK sebagai bekal memimpin pertandingan antar sekolah.',
    body: [
      'KKG PJOK Kecamatan Tanjung menggelar pelatihan wasit sepak bola yang diikuti oleh puluhan guru PJOK dari berbagai sekolah dasar mitra. Kegiatan ini bertujuan membekali para guru dengan pemahaman aturan permainan terbaru serta teknik memimpin pertandingan secara adil dan tegas di lapangan.',
      'Selain materi peraturan permainan, peserta juga mendapatkan praktik langsung memimpin pertandingan simulasi sehingga lebih siap ketika bertugas sebagai wasit pada kejuaraan maupun pertandingan persahabatan antar sekolah di lingkungan Kecamatan Tanjung.'
    ]
  },
  {
    id: 1,
    gClass: 'g2',
    tag: 'Lomba',
    cat: 'lomba',
    title: 'Kejuaraan Bulutangkis Antar Sekolah',
    date: '2 Februari 2026',
    image: 'assets/img/foto_beranda2.jpg',
    excerpt: 'Ajang kompetisi bulutangkis antar sekolah yang menjadi wadah unjuk prestasi siswa binaan anggota KKG.',
    body: [
      'Kejuaraan bulutangkis antar sekolah dasar se-Kecamatan Tanjung berlangsung meriah dengan diikuti oleh perwakilan siswa dari sekolah-sekolah mitra KKG PJOK. Ajang ini digagas sebagai wadah unjuk prestasi sekaligus menumbuhkan semangat sportivitas sejak dini.',
      'Para guru PJOK anggota KKG turut berperan aktif sebagai pelatih, wasit, hingga panitia penyelenggara, sehingga kejuaraan dapat berjalan lancar dan menghasilkan bibit-bibit atlet muda yang siap berkembang ke jenjang kompetisi yang lebih tinggi.'
    ]
  },
  {
    id: 2,
    gClass: 'g3',
    tag: 'Acara',
    cat: 'acara',
    title: 'Jambore Guru PJOK Tanjung',
    date: '14 Maret 2026',
    image: 'assets/img/foto_beranda3.jpg',
    excerpt: 'Kegiatan kebersamaan tahunan seluruh anggota KKG PJOK SD Kecamatan Tanjung.',
    body: [
      'Jambore Guru PJOK menjadi agenda tahunan yang mempertemukan seluruh anggota KKG PJOK SD Kecamatan Tanjung dalam suasana kekeluargaan. Rangkaian acara diisi dengan berbagai permainan kelompok, diskusi santai, hingga sesi berbagi pengalaman mengajar antar sekolah.',
      'Melalui kegiatan ini, silaturahmi antar guru semakin erat dan semangat kolaborasi dalam mengembangkan pembelajaran PJOK di masing-masing sekolah pun ikut terjaga.'
    ]
  },
  {
    id: 3,
    gClass: 'g4',
    tag: 'Pelatihan',
    cat: 'pelatihan',
    title: 'Workshop Kurikulum Merdeka',
    date: '5 April 2026',
    image: 'assets/img/foto_beranda.jpg',
    excerpt: 'Workshop pendalaman implementasi Kurikulum Merdeka untuk mata pelajaran PJOK.',
    body: [
      'Workshop ini menghadirkan pembahasan mendalam mengenai implementasi Kurikulum Merdeka khusus untuk mata pelajaran PJOK, mulai dari penyusunan modul ajar, capaian pembelajaran, hingga strategi asesmen yang sesuai dengan karakteristik peserta didik sekolah dasar.',
      'Peserta juga diajak berdiskusi kelompok untuk merancang contoh perangkat ajar yang dapat langsung diterapkan di kelas masing-masing, sehingga hasil workshop benar-benar aplikatif dan tidak berhenti pada teori semata.'
    ]
  },
  {
    id: 4,
    gClass: 'g5',
    tag: 'Lomba',
    cat: 'lomba',
    title: 'Turnamen Bola Voli Guru',
    date: '20 April 2026',
    image: 'assets/img/foto_beranda2.jpg',
    excerpt: 'Turnamen persahabatan bola voli antar guru anggota KKG PJOK Kecamatan Tanjung.',
    body: [
      'Turnamen bola voli antar guru digelar sebagai ajang persahabatan sekaligus menjaga kebugaran jasmani para anggota KKG PJOK. Setiap sekolah mitra mengirimkan tim perwakilannya untuk bertanding dalam suasana yang kompetitif namun tetap penuh keakraban.',
      'Selain mempererat hubungan antar sekolah, turnamen ini juga menjadi sarana bagi para guru untuk saling bertukar strategi permainan yang nantinya bisa diterapkan dalam pembelajaran PJOK di kelas.'
    ]
  },
  {
    id: 5,
    gClass: 'g6',
    tag: 'Acara',
    cat: 'acara',
    title: 'Halalbihalal & Rapat Anggota',
    date: '10 Mei 2026',
    image: 'assets/img/foto_beranda3.jpg',
    excerpt: 'Momen silaturahmi dan rapat rutin anggota dalam suasana kekeluargaan.',
    body: [
      'Acara halalbihalal sekaligus rapat rutin anggota KKG PJOK Kecamatan Tanjung berlangsung penuh kehangatan. Selain mempererat tali silaturahmi pasca hari raya, kesempatan ini juga dimanfaatkan untuk membahas program kerja serta evaluasi kegiatan yang telah berjalan.',
      'Rapat ditutup dengan penyusunan agenda kegiatan periode berikutnya sebagai bentuk komitmen bersama seluruh anggota untuk terus bergerak dan berdampak bagi dunia pendidikan jasmani di Kecamatan Tanjung.'
    ]
  }
];

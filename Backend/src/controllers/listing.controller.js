export class ListingController {
  constructor(listingService) {
    if (!listingService) {
      throw new Error('ListingController icin listingService bagimliligi zorunludur.');
    }
    this.listingService = listingService;
  }

  getAll = async (req, res) => {
    const result = await this.listingService.getAllListings(req.query);

    res.status(200).json({
      success: true,
      data: result.items,
      meta: result.pagination,
    });
  };

  getById = async (req, res) => {
    const id = Number(req.params.id);
    const listing = await this.listingService.getListingById(id);

    res.status(200).json({
      success: true,
      data: listing,
    });
  };

  create = async (req, res) => {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const createdListing = await this.listingService.createListing(req.body, imageUrl, req.user);

    res.status(201).json({
      success: true,
      message: 'Ilan basariyla olusturuldu.',
      data: createdListing,
    });
  };

  update = async (req, res) => {
    const id = Number(req.params.id);
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const updatedListing = await this.listingService.updateListing(id, req.body, imageUrl, req.user);

    res.status(200).json({
      success: true,
      message: 'Ilan basariyla guncellendi.',
      data: updatedListing,
    });
  };

  remove = async (req, res) => {
    const id = Number(req.params.id);
    await this.listingService.deleteListing(id, req.user);

    res.status(200).json({
      success: true,
      message: 'Ilan ve iliskili resim dosyasi basariyla silindi.',
    });
  };

  changeStatus = async (req, res) => {
    const id = Number(req.params.id);
    const updatedListing = await this.listingService.changeListingStatus(id, req.body.status, req.user);

    res.status(200).json({
      success: true,
      message: `Ilan durumu basariyla '${updatedListing.status}' olarak guncellendi.`,
      data: updatedListing,
    });
  };
}


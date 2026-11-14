export class AuthController {
  constructor(authService) {
    if (!authService) {
      throw new Error('AuthController için authService bağımlılığı zorunludur.');
    }
    this.authService = authService;
  }

  register = async (req, res) => {
    const result = await this.authService.register(req.body);

    res.status(201).json({
      success: true,
      message: 'Kullanıcı kaydı başarıyla tamamlandı.',
      data: result,
    });
  };

  login = async (req, res) => {
    const result = await this.authService.login(req.body);

    res.status(200).json({
      success: true,
      message: 'Giriş başarılı.',
      data: result,
    });
  };

  getMe = async (req, res) => {
    const user = await this.authService.getMe(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  };
}


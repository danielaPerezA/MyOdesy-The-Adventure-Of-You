import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {
  @Input() isPrivate: boolean = false;
  @Input() username: string = '';

  constructor(private router: Router) {}

  goToProfile() {
    this.router.navigate(['/perfil']);
  }

  logout() {
    localStorage.removeItem('UsuarioLogueado');
    localStorage.removeItem('emailUsuario');
    this.router.navigate(['/']);
  }
}